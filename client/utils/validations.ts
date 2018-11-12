import * as Yup from "yup";

export const LoginFormSchema = Yup.object().shape({
  user: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required")
});

export const RegisterFormSchema = Yup.object().shape({
  legalChecked: Yup.boolean().required("You should agree to the legal stuff"),
  username: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required"),
  email: Yup.string()
    .email()
    .required("Email is required")
});

export const LocalSettingsSchema = Yup.object().shape({
  fileExtension: Yup.string().matches(/.(md|mdx|txt)/, {
    message: "Must be .md, .mdx or .txt",
    excludeEmptyString: true
  })
});
