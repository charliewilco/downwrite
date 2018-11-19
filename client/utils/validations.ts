import * as Yup from "yup";

// 1. must contain 1 lowercase letter
// 2. must contain 1 uppercase letter
// 3. must contain 1 numeric character
// 4. must contain 1 special character
// 5. must contain 6 characters

const validPasswordMessage = `Password, must contain 1 lowercase and 1 uppercase letter, 1 number, 1 special character, and be at least 6 characters. Also, must not reveal the location of the Soul Stone.`;

export const LoginFormSchema = Yup.object().shape({
  user: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required")
});

export const RegisterFormSchema = Yup.object().shape({
  legalChecked: Yup.boolean().required("You should agree to the legal stuff"),
  username: Yup.string().required("Username is required"),
  password: Yup.string()
    .matches(
      /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/
    )
    .required(validPasswordMessage),
  email: Yup.string()
    .email()
    .required("Email is required")
});

export const UserSettingsSchema = Yup.object().shape({
  username: Yup.string().required("You need a user name"),
  email: Yup.string()
    .email()
    .required("Email is required")
});

export const UpdatePasswordSchema = Yup.object().shape({
  oldPassword: Yup.string().required("Old password is required"),
  newPassword: Yup.string()
    .matches(
      /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/
    )
    .required(validPasswordMessage),
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
