import * as Yup from "yup";
import { passwordRegex } from "src/shared/validations";
import { validPasswordMessage } from "src/shared/constants";

export const createUserValidation = Yup.object().shape({
  username: Yup.string().required(),
  email: Yup.string().email().required(),
  password: Yup.string().matches(passwordRegex, validPasswordMessage)
});
