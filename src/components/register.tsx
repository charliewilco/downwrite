import * as React from "react";
import { Formik, Form, FormikProps, ErrorMessage } from "formik";
import UIInput, { UIInputError, UIInputContainer } from "./ui-input";
import { Button } from "./button";
import LegalBoilerplate from "./legal-boilerplate";
import { useLoginFns, IRegisterValues } from "../hooks/login";
import { RegisterFormSchema } from "../utils/validations";
import { StringTMap } from "../utils/types";

interface IInput extends StringTMap<string> {
  name?: string;
  type?: string;
  placeholder?: string;
  label?: string;
  autoComplete?: string;
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

export default function RegisterForm(): JSX.Element {
  const { onRegisterSubmit } = useLoginFns();

  const initialValues: IRegisterValues = {
    legalChecked: false,
    username: "",
    password: "",
    email: ""
  };

  return (
    <Formik
      validationSchema={RegisterFormSchema}
      initialValues={initialValues}
      onSubmit={onRegisterSubmit}>
      {({ values, handleChange }: FormikProps<IRegisterValues>) => (
        <Form>
          <div>
            {REGISTER_INPUTS.map(input => (
              <UIInputContainer key={input.name}>
                <UIInput
                  type={input.type}
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
          </div>
          <LegalBoilerplate
            name="legalChecked"
            checked={values.legalChecked}
            onChange={handleChange}
          />
          <div className="u-right">
            <UIInputContainer style={{ display: "inline-block" }}>
              <Button disabled={!values.legalChecked} type="submit">
                Register
              </Button>
            </UIInputContainer>
          </div>
        </Form>
      )}
    </Formik>
  );
}
