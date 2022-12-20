import { QueryResolvers } from "../../graphql.js";
import { UserModel } from "../User/model.js";

export const whoami =
  (): QueryResolvers["whoami"] =>
  async (_parent, _args, { user }) => {
    if (!user) return null;
    return new UserModel(user);
  };
