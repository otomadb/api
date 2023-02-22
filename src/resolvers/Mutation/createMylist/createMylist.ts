import { CreateMylistOtherErrorMessage, MutationResolvers, UserRole as GraphQLUserRole } from "../../graphql.js";
import { ResolverDeps } from "../../index.js";
import { MylistModel } from "../../Mylist/model.js";
import { create } from "./create.js";

export const createMylist = ({ prisma, logger }: Pick<ResolverDeps, "prisma" | "logger">) =>
  (async (_parent, { input: { title, range } }, { user: ctxUser }, info) => {
    if (!ctxUser)
      return {
        __typename: "MutationAuthenticationError",
        requiredRole: GraphQLUserRole.User,
      } as const;

    const result = await create(prisma, { title, userId: ctxUser.id, range });
    if (result.status === "error") {
      switch (result.error.message) {
        case "INTERNAL_SERVER_ERROR":
          logger.error({ error: result.error.error, path: info.path }, "Something error happens");
          return {
            __typename: "CreateMylistOtherErrorsFallback",
            message: CreateMylistOtherErrorMessage.InternalServerError,
          } as const;
      }
    }

    return {
      __typename: "CreateMylistSucceededPayload",
      mylist: new MylistModel(result.data),
    } as const;
  }) satisfies MutationResolvers["createMylist"];
