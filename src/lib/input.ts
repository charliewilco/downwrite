import * as Yup from "yup";
import { ICreateUserMutationVariables } from "@utils/resolver-types";
import { passwordRegex } from "@utils/validations";
import { validPasswordMessage } from "@utils/constants";

export const createUserValidation = Yup.object().shape<ICreateUserMutationVariables>(
  {
    username: Yup.string().required(),
    email: Yup.string().email().required(),
    password: Yup.string().matches(passwordRegex, validPasswordMessage)
  }
);
