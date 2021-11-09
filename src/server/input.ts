import * as Yup from "yup";
import { passwordRegex } from "@shared/validations";
import { validPasswordMessage } from "@shared/constants";

export const createUserValidation = Yup.object().shape({
  username: Yup.string().required(),
  email: Yup.string().email().required(),
  password: Yup.string().matches(passwordRegex, validPasswordMessage)
});
