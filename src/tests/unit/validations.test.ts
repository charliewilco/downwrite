import * as Validations from "@utils/validations";
import * as Inputs from "@lib/input";

describe("Validations", () => {
  it("Local Settings", async () => {
    await expect(
      Validations.LocalSettingsSchema.isValid({
        fontFamily: "Fira Code",
        fileExtension: "doc"
      })
    ).resolves.toBeFalsy();
  });

  it("Register", async () => {
    await expect(
      Validations.RegisterFormSchema.isValid({
        legalChecked: false
      })
    ).resolves.toBeFalsy();

    await expect(
      Validations.RegisterFormSchema.validate(
        {
          legalChecked: false,
          password: "Nope",
          email: "email@test.com",
          user: "charlie"
        },
        { abortEarly: false }
      )
    ).rejects.toThrowError();
  });

  it("User Settings", async () => {
    await expect(
      Validations.UserSettingsSchema.isValid({
        email: "red.com",
        user: "somehello"
      })
    ).resolves.toBeFalsy();
  });

  it("Login", async () => {
    expect(
      Validations.LoginFormSchema.isValid(
        {
          user: "hello",
          password: "not hello"
        },
        { strict: true }
      )
    ).resolves.toBeTruthy();
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
      Inputs.createUserValidation.validate(broken, { strict: true })
    ).rejects.toThrowError();

    await expect(Inputs.createUserValidation.validate(working)).resolves.toBe(
      working
    );
  });
});
