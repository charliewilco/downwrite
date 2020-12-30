import * as Yup from "yup";
import { passwordRegex } from "@utils/validations";
import { validPasswordMessage } from "@utils/constants";

export const createUserValidation = Yup.object().shape({
  username: Yup.string().required(),
  email: Yup.string().email().required(),
  password: Yup.string().matches(passwordRegex, validPasswordMessage)
});
