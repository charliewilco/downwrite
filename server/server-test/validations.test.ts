import * as Joi from "@hapi/joi";
import { validUser } from "../models";

describe("validations", () => {
  it("user password", async () => {
    const valid = Joi.validate(
      {
        username: "hello",
        email: "hello@user.no",
        password: "Nothhing!12"
      },
      validUser
    );

    const invalid = Joi.validate(
      {
        username: "hello",
        email: "hello@user.no",
        password: "nothing"
      },
      validUser
    );
    expect(valid.error).toBeNull();
    expect(invalid.error).not.toBeNull();
  });
});
