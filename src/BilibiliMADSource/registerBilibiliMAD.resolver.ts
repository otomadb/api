import { GraphQLError } from "graphql";

import { parseGqlIDs3 } from "../resolvers/id.js";
import { checkDuplicate } from "../utils/checkDuplicate.js";
import { MkMutationResolver } from "../utils/MkResolver.js";
import { isErr } from "../utils/Result.js";

export const mkRegisterBilibiliMADResolver: MkMutationResolver<"registerBilibiliMAD", "BilibiliMADSourceService"> =
  ({ BilibiliMADSourceService }) =>
  async (_parent, { input }, { currentUser: { id: userId } }) => {
    const tagIds = parseGqlIDs3("Tag", input.tagIds);
    if (isErr(tagIds)) {
      switch (tagIds.error.type) {
        case "INVALID_ID":
          throw new GraphQLError("bad request: invalid tag id");
        case "DUPLICATED":
          throw new GraphQLError("bad request: duplicated tag id");
      }
    }

    const semitagNames = checkDuplicate(input.semitagNames);
    if (isErr(semitagNames)) throw new GraphQLError("bad request: duplicated semitag names");

    // TODO: Bilibiliのbvidとして妥当かどうかのチェック
    const sourceIds = checkDuplicate(input.sourceIds);
    if (isErr(sourceIds)) throw new GraphQLError("bad request: duplicated source ids");

    const result = await BilibiliMADSourceService.register(
      {
        primaryTitle: input.primaryTitle,
        primaryThumbnail: input.primaryThumbnailUrl,
        tagIds: tagIds.data,
        semitagNames: semitagNames.data,
        sourceIds: sourceIds.data,
      },
      userId,
    );

    if (isErr(result)) return { __typename: "MutationInternalServerError" };

    return {
      __typename: "RegisterBilibiliMADSucceededPayload",
      video: result.data,
    };
  };

export type RegisterBilibiliMADResolver = ReturnType<typeof mkRegisterBilibiliMADResolver>;