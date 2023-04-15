import { GraphQLError } from "graphql";
import z from "zod";

import { QueryResolvers } from "../../graphql.js";
import { parseGqlID } from "../../id.js";
import { NicovideoRegistrationRequestModel } from "../../NicovideoRegistrationRequest/model.js";
import { ResolverDeps } from "../../types.js";

export const resolverFindNicovideoRegistrationRequest = ({ prisma, logger }: Pick<ResolverDeps, "logger" | "prisma">) =>
  (async (_, { input: unparsedInput }, { currentUser: ctxUser }, info) => {
    const parsed = z.union([z.object({ id: z.string() }), z.object({ sourceId: z.string() })]).safeParse(unparsedInput);
    if (!parsed.success) {
      logger.error({ path: info.path, args: { input: unparsedInput }, userId: ctxUser?.id }, "Invalid input");
      throw new GraphQLError("Argument 'input' is invalid.");
    }

    const input = parsed.data;
    if ("id" in input) {
      const req = await prisma.nicovideoRegistrationRequest.findUnique({
        where: { id: parseGqlID("NicovideoRegistrationRequest", input.id) },
      });
      if (!req) {
        logger.info({ path: info.path, id: input.id, userId: ctxUser?.id }, "Not found");
        return null;
      }
      return new NicovideoRegistrationRequestModel(req);
    } else {
      const req = await prisma.nicovideoRegistrationRequest.findUnique({
        where: { sourceId: input.sourceId },
      });
      if (!req) {
        logger.info({ path: info.path, sourceId: input.sourceId, userId: ctxUser?.id }, "Not found");
        return null;
      }
      return new NicovideoRegistrationRequestModel(req);
    }
  }) satisfies QueryResolvers["findNicovideoRegistrationRequest"];
