import * as Yup from "yup";

import { validLegalMessage, validPasswordMessage } from "@utils/constants";

// 1. must contain 1 lowercase letter
// 2. must contain 1 uppercase letter
// 3. must contain 1 numeric character
// 4. must contain 1 special character
// 5. must contain 6 characters

export const LoginFormSchema = Yup.object().shape({
  user: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required")
});

export const legacyPasswordRegex = new RegExp(
  /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/
);

export const passwordRegex = new RegExp(
  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/
);

export const passwordStringSchema = Yup.string()
  .matches(passwordRegex, {
    message: validPasswordMessage,
    excludeEmptyString: true
  })
  .required("Must include password");

/// Forms

export const RegisterFormSchema = Yup.object().shape({
  legalChecked: Yup.boolean()
    .oneOf([true], validLegalMessage)
    .required(validLegalMessage),
  username: Yup.string().required("Username is required"),
  password: Yup.string()
    .matches(passwordRegex, {
      message: validPasswordMessage,
      excludeEmptyString: true
    })
    .required("Must include password"),
  email: Yup.string().email().required("Email is required")
});

export const UserSettingsSchema = Yup.object().shape({
  username: Yup.string().required("You need a user name"),
  email: Yup.string().email().required("Email is required")
});

export const UpdatePasswordSchema = Yup.object().shape({
  oldPassword: Yup.string().required("Old password is required"),
  newPassword: Yup.string()
    .matches(passwordRegex, {
      message: validPasswordMessage,
      excludeEmptyString: true
    })
    .required("Must include password"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword"), null])
    .required("Passwords must match")
});

export const LocalSettingsSchema = Yup.object().shape({
  fontFamily: Yup.string(),
  fileExtension: Yup.string()
    .matches(/.(md|mdx|txt)/)
    .required("Must be .md, .mdx or .txt")
});
