import * as Validations from "@shared/validations";

describe("Validations", () => {
  it("Local Settings", async () => {
    await expect(
      Validations.LocalSettingsSchema.parseAsync({
        fontFamily: "Fira Code",
        fileExtension: "doc"
      })
    ).rejects.toThrowError();
  });

  it("Register", async () => {
    await expect(
      Validations.RegisterFormSchema.parseAsync({
        legalChecked: false
      })
    ).rejects.toThrowError();

    await expect(
      Validations.RegisterFormSchema.parseAsync({
        legalChecked: false,
        password: "Nope",
        email: "email@test.com",
        user: "charlie"
      })
    ).rejects.toThrowError();
  });

  it("User Settings", async () => {
    await expect(
      Validations.UserSettingsSchema.parseAsync({
        email: "red.com",
        user: "somehello"
      })
    ).rejects.toThrowError();
  });

  it("Login", async () => {
    await expect(
      Validations.LoginFormSchema.parseAsync({
        user: "hello",
        password: "not hello"
      })
    ).rejects.toThrowError();
  });

  it("passwords", async () => {
    const working = {
      username: "...",
      email: "test@test.com",
      password: "P@ssw0rd"
    };

    const broken = {
      username: "...",
      email: "test@test.com",
      password: "Expect"
    };

    await expect(
      Validations.createUserValidation.parseAsync(broken)
    ).rejects.toThrowError();

    expect(Validations.createUserValidation.parse(working)).toStrictEqual(working);
  });
});
