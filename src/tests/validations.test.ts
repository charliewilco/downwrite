import * as Validations from "../utils/validations";
import * as Inputs from "../lib/input";

describe("Validations", () => {
  it("Local Settings", async () => {
    const result = await Validations.LocalSettingsSchema.isValid({
      fontFamily: "Fira Code",
      fileExtension: "doc"
    });
    expect(result).toBeFalsy();
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
    const result = await Validations.UserSettingsSchema.isValid({
      email: "red.com",
      user: "somehello"
    });

    expect(result).toBeFalsy();
  });

  it("Login", async () => {
    const result = await Validations.LoginFormSchema.isValid(
      {
        user: "hello",
        password: "not hello"
      },
      { strict: true }
    );
    expect(result).toBeTruthy();
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
