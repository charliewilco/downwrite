import * as Yup from "yup";
import { passwordRegex } from "@shared/validations";
import { VALID_PASSWORD } from "@shared/constants";

export const createUserValidation = Yup.object().shape({
  username: Yup.string().required(),
  email: Yup.string().email().required(),
  password: Yup.string().matches(passwordRegex, VALID_PASSWORD)
});
