import { UserModel } from "../../graphql/models.js";
import { resolveId } from "./index.js";

describe("User resolver", () => {
  describe("id", () => {
    it("add prefix", () => {
      const actual = resolveId({ id: "2" } as UserModel);
      expect(actual).toBe("user:2");
    });
  });
});
