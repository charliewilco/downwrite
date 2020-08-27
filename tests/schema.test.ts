import * as Validations from "../src/utils/validations";

describe("Validations", () => {
  it("Local Settings", async () => {
    const result = await Validations.LocalSettingsSchema.isValid({
      fontFamily: "Fira Code",
      fileExtension: "doc"
    });
    expect(result).toBeFalsy();
  });

  it("User Settings", async () => {
    const result = await Validations.UserSettingsSchema.isValid({
      email: "red.com",
      user: "somehello"
    });

    expect(result).toBeFalsy();
  });

  it("Login", async () => {
    const result = await Validations.LoginFormSchema.isValid({
      user: "hello",
      password: "not hello"
    });
    expect(result).toBeTruthy();
  });
});
