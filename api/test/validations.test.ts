import * as Joi from "joi";
import * as User from "../src/models/User";

describe("validations", () => {
  it("user password", async () => {
    const valid = Joi.validate(
      {
        username: "hello",
        email: "hello@user.no",
        password: "Nothhing!12"
      },
      User.validUser
    );

    const invalid = Joi.validate(
      {
        username: "hello",
        email: "hello@user.no",
        password: "nothing"
      },
      User.validUser
    );
    expect(valid.error).toBeNull();
    expect(invalid.error).not.toBeNull();
  });
});
