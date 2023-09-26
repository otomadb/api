// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable no-process-env */
import { createServer } from "node:http";

import { ResolveUserFn, useGenericAuth, ValidateUserFn } from "@envelop/generic-auth";
import { PrismaClient } from "@prisma/client";
import { ManagementClient } from "auth0";
import { GraphQLError, ListValueNode, StringValueNode } from "graphql";
import { createSchema, createYoga, useLogger, useReadinessCheck } from "graphql-yoga";
import { Redis } from "ioredis";
import jwt, { GetPublicKeyOrSecret } from "jsonwebtoken";
import createJwksClient from "jwks-rsa";
import { MeiliSearch } from "meilisearch";
import neo4j from "neo4j-driver";
import { pino } from "pino";
import z from "zod";

import { mkBilibiliMADSourceService } from "./BilibiliMADSource/BilibiliMADSource.service.js";
import { ImagesService } from "./Common/Images.service.js";
import { mkLoggerService } from "./Common/Logger.service.js";
import { mkSoundcloudService } from "./Common/Soundcloud.service.js";
import { mkNeo4jService } from "./Neo4j/Neo4j.service.js";
import { makeResolvers } from "./resolvers/index.js";
import { CurrentUser, ServerContext, UserContext } from "./resolvers/types.js";
import typeDefs from "./schema.graphql";
import { SoundcloudService } from "./SoundcloudVideoSource/service.js";
import { UserService } from "./User/service.js";

const jwksClient = createJwksClient({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
});
const getPublicKey: GetPublicKeyOrSecret = async (header, callback) => {
  jwksClient.getSigningKey(header.kid, function (err, key) {
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
};

const auth0Management = new ManagementClient(
  process.env.AUTH0_MANAGEMENT_API_TOKEN
    ? {
        domain: process.env.AUTH0_DOMAIN,
        token: process.env.AUTH0_MANAGEMENT_API_TOKEN,
      }
    : {
        domain: process.env.AUTH0_DOMAIN,
        clientId: process.env.AUTH0_CLIENT_ID,
        clientSecret: process.env.AUTH0_CLIENT_SECRET,
        scope: ["read:users", "update:users", "read:roles"].join(" "),
      },
);

const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "trace",
  transport: {
    targets: [
      {
        target: "pino-pretty",
        level: process.env.NODE_ENV === "production" ? "info" : "trace",
        options: {},
      },
      {
        target: "pino/file",
        level: process.env.NODE_ENV === "production" ? "info" : "trace",
        options: {
          destination: "logs/out.log",
          mkdir: true,
        },
      },
    ],
  },
});

const prismaClient = new PrismaClient();

const neo4jDriver = neo4j.driver(
  process.env.NEO4J_URL,
  neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD),
);

const meilisearchClient = new MeiliSearch({
  host: process.env.MEILISEARCH_URL,
});

const redisClient = new Redis(process.env.REDIS_URL);

const LoggerService = mkLoggerService({ pinoLogger: logger });
const Neo4jService = mkNeo4jService({ driver: neo4jDriver, LoggerService });

const yoga = createYoga<ServerContext, UserContext>({
  graphiql: process.env.ENABLE_GRAPHIQL === "true",
  schema: createSchema({
    typeDefs,
    resolvers: makeResolvers({
      soundcloudService: SoundcloudService.make({
        env: { clientId: process.env.SOUNDCLOUD_CLIENT_ID },
      }),
      neo4j: neo4jDriver,
      prisma: prismaClient,
      meilisearch: meilisearchClient,
      logger,
      userService: UserService.make({
        auth0Management,
        logger,
        redis: redisClient,
        prisma: prismaClient,
        env: {
          editorRoleId: process.env.AUTH0_EDITOR_ROLE_ID,
          adminRoleId: process.env.AUTH0_ADMIN_ROLE_ID,
        },
      }),
      ImagesService: ImagesService.make({
        env: { baseUrl: process.env.IXGYOHN_BASE_URL },
      }),
      BilibiliMADSourceService: mkBilibiliMADSourceService({
        prisma: prismaClient,
        Neo4jService,
      }),
      SoundcloudService: mkSoundcloudService({
        redis: redisClient,
        logger,
      }),
    }),
  }),
  cors: (request) => {
    const origin = request.headers.get("origin");
    return {
      origin: origin || [],
      credentials: true,
    };
  },
  plugins: [
    useGenericAuth({
      mode: "protect-granular",
      resolveUserFn: (async ({ req }) => {
        const token = req.headers.authorization?.split(" ").at(1);
        if (token) {
          logger.trace({ token });
          const result = await new Promise<{ error: jwt.VerifyErrors } | { decoded: jwt.Jwt }>((resolve, reject) =>
            jwt.verify(token, getPublicKey, { complete: true }, (error, decoded) => {
              if (error) return resolve({ error });
              if (decoded) resolve({ decoded });
              reject();
            }),
          );
          if ("error" in result) {
            logger.error({ error: result.error }, "Token verification error");
            return null;
          }
          const payload = z.object({ sub: z.string(), scope: z.string() }).safeParse(result.decoded.payload);
          if (!payload.success) {
            logger.error({ error: payload.error }, "Unexpected token payload");
            return null;
          }

          logger.trace(payload.data);
          const { sub, scope } = payload.data;
          return { id: sub, scopes: scope.split(" ") };
        }
        return null;
      }) satisfies ResolveUserFn<CurrentUser, ServerContext>,
      validateUser: (({ user, fieldAuthDirectiveNode }) => {
        if (!fieldAuthDirectiveNode) return;

        if (!user) {
          throw new GraphQLError(`Not authenticated`, {
            extensions: { code: "NOT_AUTHENTICATED" },
          });
        }

        const valueNode = fieldAuthDirectiveNode?.arguments?.find((arg) => arg.name.value === "scopes")?.value as
          | ListValueNode
          | undefined;
        const requireScopes = valueNode?.values.map((v) => (v as StringValueNode).value) || [];

        logger.trace({ have: user.scopes, require: requireScopes });

        const missingScope = requireScopes.find((p) => !user.scopes.includes(p));
        if (missingScope) {
          logger.error({ user, scope: missingScope }, "Missing scope");
          throw new GraphQLError(`Missing scope`, {
            extensions: { code: "FORBIDDEN", scope: missingScope },
          });
        }

        return;
      }) satisfies ValidateUserFn<CurrentUser>,
    }),
    useReadinessCheck({
      check: async () => {
        try {
          await Promise.all([
            prismaClient.$queryRaw`SELECT 1`
              .catch(async (e) => {
                logger.warn({ error: e }, "Prisma is not ready, reconnecting.");
                await prismaClient.$connect();
              })
              .catch((e) => {
                logger.error({ error: e }, "Prisma is not ready, reconnecting failed.");
                throw e;
              }),
            neo4jDriver.getServerInfo().catch((e) => {
              logger.error({ error: e }, "Neo4j is not ready.");
              throw e;
            }),
            redisClient.ping().catch((e) => {
              logger.error({ error: e }, "Redis is not ready.");
              throw e;
            }),
          ]);
        } catch {
          return false;
        }
      },
    }),
    /*
    usePrometheus({
      execute: true,
      errors: true,
      requestCount: true,
      requestSummary: true,
    }),
    */
    useLogger({
      logFn(event, data) {
        switch (event) {
          case "execute-end":
            logger.info(
              {
                // query: print(data.args.document),
                operation: data.args.operationName,
                variables: data.args.variableValues || {},
                user: data.args.contextValue.user,
                errors: data.result.errors,
              },
              "GraphQL Executed",
            );
            break;
        }
      },
    }),
  ],
});

const server = createServer(yoga);
server.listen(8080, () => {
  logger.info("Server is running on http://localhost:8080");
});
