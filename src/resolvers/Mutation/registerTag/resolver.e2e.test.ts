import { buildHTTPExecutor, HTTPExecutorOptions } from "@graphql-tools/executor-http";
import { SyncExecutor } from "@graphql-tools/utils";
import { PrismaClient } from "@prisma/client";
import { parse } from "graphql";
import { createSchema, createYoga } from "graphql-yoga";
import { auth as neo4jAuth, driver as createNeo4jDriver } from "neo4j-driver";
import { afterAll, beforeAll, beforeEach, describe, expect, test } from "vitest";
import { mock, mockReset } from "vitest-mock-extended";

import { cleanPrisma } from "../../../test/cleanPrisma.js";
import { ServerContext, UserContext } from "../../context.js";
import { typeDefs } from "../../graphql.js";
import { buildGqlId } from "../../id.js";
import { makeResolvers, ResolverDeps } from "../../index.js";

describe("Mutation.registerTag e2e", () => {
  let prisma: ResolverDeps["prisma"];
  let neo4j: ResolverDeps["neo4j"];
  let logger: ResolverDeps["logger"];
  let config: ResolverDeps["config"];

  let executor: SyncExecutor<unknown, HTTPExecutorOptions>;

  beforeAll(async () => {
    prisma = new PrismaClient({ datasources: { db: { url: process.env.TEST_PRISMA_DATABASE_URL } } });
    await prisma.$connect();

    neo4j = createNeo4jDriver(
      process.env.TEST_NEO4J_URL,
      neo4jAuth.basic(process.env.TEST_NEO4J_USERNAME, process.env.TEST_NEO4J_PASSWORD)
    );

    logger = mock<ResolverDeps["logger"]>();
    config = mock<ResolverDeps["config"]>();

    const schema = createSchema({ typeDefs, resolvers: makeResolvers({ prisma, neo4j, logger, config }) });
    const yoga = createYoga<ServerContext, UserContext>({ schema });
    executor = buildHTTPExecutor({ fetch: yoga.fetch });
  });

  beforeEach(async () => {
    await cleanPrisma(prisma);
    // TODO: neo4jのreset処理

    mockReset(logger);
    mockReset(config);
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await neo4j.close();
  });

  test.each([
    [
      {
        primaryName: "name 1",
        extraNames: ["name 2", "name 3"],
        explicitParent: "t1",
        implicitParents: [buildGqlId("Tag", "t2"), buildGqlId("Tag", "t3")],
        resolveSemitags: [buildGqlId("Semitag", "st1"), buildGqlId("Semitag", "st2")],
      },
      {
        __typename: "MutationInvalidTagIdError",
        tagId: "t1",
      },
    ],
    [
      {
        primaryName: "name 1",
        extraNames: ["name 2", "name 3"],
        explicitParent: buildGqlId("Tag", "t1"),
        implicitParents: ["t2", buildGqlId("Tag", "t3")],
        resolveSemitags: [buildGqlId("Semitag", "st1"), buildGqlId("Semitag", "st2")],
      },
      {
        __typename: "MutationInvalidTagIdError",
        tagId: "t2",
      },
    ],
    [
      {
        primaryName: "name 1",
        extraNames: ["name 2", "name 3"],
        explicitParent: buildGqlId("Tag", "t1"),
        implicitParents: [buildGqlId("Tag", "t2"), buildGqlId("Tag", "t3")],
        resolveSemitags: ["st1", buildGqlId("Semitag", "st2")],
      },
      {
        __typename: "MutationInvalidSemitagIdError",
        semitagId: "st1",
      },
    ],
    [
      {
        primaryName: "name 1",
        extraNames: ["name 2", "name 3"],
        explicitParent: buildGqlId("Tag", "t1"),
        implicitParents: [buildGqlId("Tag", "t2"), buildGqlId("Tag", "t2"), buildGqlId("Tag", "t3")],
        resolveSemitags: [buildGqlId("Semitag", "st1"), buildGqlId("Semitag", "st2")],
      },
      {
        __typename: "RegisterTagImplicitParentIdsDuplicatedError",
        tagId: buildGqlId("Tag", "t2"),
      },
    ],
    [
      {
        primaryName: "name 1",
        extraNames: ["name 2", "name 3"],
        explicitParent: buildGqlId("Tag", "t1"),
        implicitParents: [buildGqlId("Tag", "t2"), buildGqlId("Tag", "t3")],
        resolveSemitags: [buildGqlId("Semitag", "st1"), buildGqlId("Semitag", "st1"), buildGqlId("Semitag", "st2")],
      },
      {
        __typename: "RegisterTagResolveSemitagIdsDuplicatedError",
        semitagId: buildGqlId("Semitag", "st1"),
      },
    ],
    [
      {
        primaryName: "name 1",
        extraNames: ["name 2", "name 3"],
        explicitParent: buildGqlId("Tag", "t1"),
        implicitParents: [buildGqlId("Tag", "t1"), buildGqlId("Tag", "t3")],
        resolveSemitags: [buildGqlId("Semitag", "st1"), buildGqlId("Semitag", "st2")],
      },
      {
        __typename: "RegisterTagTagIdCollidedBetweenExplicitAndImplicitError",
        tagId: buildGqlId("Tag", "t1"),
      },
    ],
  ])("不適当なinput: %#", async (input, expected) => {
    const requestResult = await executor({
      document: parse(/* GraphQL */ `
        mutation E2ETest_Mutation_RegisterTag_Invalid_Input($input: RegisterTagInput!) {
          registerTag(input: $input) {
            __typename
            ... on MutationInvalidTagIdError {
              tagId
            }
            ... on MutationInvalidSemitagIdError {
              semitagId
            }
            ... on RegisterTagTagIdCollidedBetweenExplicitAndImplicitError {
              tagId
            }
            ... on RegisterTagImplicitParentIdsDuplicatedError {
              tagId
            }
            ... on RegisterTagResolveSemitagIdsDuplicatedError {
              semitagId
            }
          }
        }
      `),
      variables: { input },
      context: { user: { id: "u1", role: "EDITOR" } } satisfies UserContext,
    });

    expect(requestResult.data).toStrictEqual({
      registerTag: expected,
    });
  });
});
