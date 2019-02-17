import * as React from "react";
import { Formik, Form, FormikProps, ErrorMessage, FormikActions } from "formik";
import "isomorphic-fetch";
import UIInput, { UIInputError, UIInputContainer } from "./ui-input";
import { Button } from "./button";
import SpacedBox from "./spaced-box";
import LegalBoilerplate from "./legal-boilerplate";
import * as API from "../utils/api";
import { RegisterFormSchema } from "../utils/validations";

export interface StringTMap<T> {
  [key: string]: T;
}

interface IRegistration extends StringTMap<string | boolean> {
  username: string;
  password: string;
  legalChecked: boolean;
  email: string;
}

interface IInput extends StringTMap<string> {
  name?: string;
  type?: string;
  placeholder?: string;
  label?: string;
  autoComplete?: string;
}

interface LoginProps {
  signIn: (x: boolean, y: string) => void;
  setError: (x: string, y: string) => void;
}

const REGISTER_INPUTS: IInput[] = [
  {
    name: "username",
    label: "Username",
    placeholder: "Try for something unique",
    type: "text",
    autoComplete: "email"
  },
  {
    name: "email",
    type: "email",
    placeholder: "mail@email.com",
    label: "Email",
    autoComplete: "email"
  },
  {
    name: "password",
    type: "password",
    placeholder: "*********",
    label: "Password",
    autoComplete: "current-password"
  }
];

const Register: React.FC<LoginProps> = function(props) {
  const handleSubmit = (
    values: IRegistration,
    actions: FormikActions<IRegistration>
  ): void => {
    if (values.legalChecked) {
      onSubmit(values);
    }
  };

  const onSubmit = async ({
    username,
    email,
    password
  }: IRegistration): Promise<void> => {
    const { host } = document.location;
    const user = await API.createUser(
      { username, email, password },
      {
        host
      }
    );

    if (user.userID) {
      props.signIn(user.id_token !== undefined, user.id_token);
    } else {
      props.setError(user.message, "error");
    }
  };

  return (
    <Formik
      validationSchema={RegisterFormSchema}
      initialValues={{
        legalChecked: false,
        username: "",
        password: "",
        email: ""
      }}
      onSubmit={handleSubmit}>
      {({ values, handleChange }: FormikProps<IRegistration>) => (
        <Form>
          <SpacedBox>
            {REGISTER_INPUTS.map(input => (
              <UIInputContainer key={input.name}>
                <UIInput
                  placeholder={input.placeholder}
                  label={input.label}
                  autoComplete={input.autoComplete}
                  name={input.name}
                  value={values[input.name] as string}
                  onChange={handleChange}
                />
                <ErrorMessage name={input.name} component={UIInputError} />
              </UIInputContainer>
            ))}
          </SpacedBox>
          <LegalBoilerplate
            name="legalChecked"
            checked={values.legalChecked}
            onChange={handleChange}
          />
          <SpacedBox align="right">
            <UIInputContainer style={{ display: "inline-block" }}>
              <Button disabled={!values.legalChecked} type="submit">
                Register
              </Button>
            </UIInputContainer>
          </SpacedBox>
        </Form>
      )}
    </Formik>
  );
};

export default Register;
