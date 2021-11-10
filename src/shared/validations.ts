import { z } from "zod";
import { VALID_LEGAL, VALID_PASSWORD } from "@shared/constants";

export class ValidationError extends Error {
  public name = "ValidationError";

  public inner: Array<{ path: string; message: string }> = [];

  public constructor(message: string) {
    super(message);
  }
}

function createValidationError(e: z.ZodError) {
  const error = new ValidationError(e.message);
  error.inner = e.errors.map((err) => ({
    message: err.message,
    path: err.path.join(".")
  }));

  return error;
}

/**
 * Wrap your zod schema in this function when providing it to Formik's validation schema prop
 * @param schema The zod schema
 * @returns An object containing the `validate` method expected by Formik
 */
export function zodAdapter<T>(schema: z.ZodSchema<T>): {
  validate: (obj: T) => Promise<void>;
} {
  return {
    async validate(obj: T) {
      try {
        await schema.parseAsync(obj);
      } catch (err: unknown) {
        throw createValidationError(err as z.ZodError<T>);
      }
    }
  };
}

// 1. must contain 1 lowercase letter
// 2. must contain 1 uppercase letter
// 3. must contain 1 numeric character
// 4. must contain 1 special character
// 5. must contain 6 characters

export const legacyPasswordRegex = new RegExp(
  /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/
);

export const passwordRegex = new RegExp(
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/
);

export const passwordStringSchema = z
  .string({
    required_error: "Must include password"
  })
  .regex(passwordRegex, VALID_PASSWORD);

/// Forms

export const LoginFormSchema = z.object({
  user: z.string({
    required_error: "Username is required"
  }),
  password: z
    .string({
      required_error: "Password is required"
    })
    .regex(passwordRegex, VALID_PASSWORD)
});

export const RegisterFormSchema = z.object({
  legalChecked: z.boolean({
    required_error: VALID_LEGAL
  }),
  username: z.string({ required_error: "Username is required" }),
  password: z
    .string({
      required_error: "Must include password"
    })
    .regex(passwordRegex, VALID_PASSWORD),
  email: z.string({ required_error: "Email is required" }).email()
});

export const UserSettingsSchema = z.object({
  username: z.string({ required_error: "You need a user name" }),
  email: z.string({ required_error: "Email is required" }).email()
});

export const UpdatePasswordSchema = z
  .object({
    oldPassword: z.string({ required_error: "Old password is required" }),
    newPassword: z.string().regex(passwordRegex, VALID_PASSWORD),
    confirmPassword: z.string()
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"] // path of error
  });

export const LocalSettingsSchema = z.object({
  fontFamily: z.string(),
  fileExtension: z.enum([".md", ".mdx", ".txt"])
});

export const createUserValidation = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string().regex(passwordRegex, VALID_PASSWORD)
});
