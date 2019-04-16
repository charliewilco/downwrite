import * as React from "react";
import { Formik, Form, FormikProps, ErrorMessage } from "formik";
import UIInput, { UIInputError, UIInputContainer } from "./ui-input";
import { Button } from "./button";
import useLoginFns, { ILoginValues } from "../hooks/login";
import { LoginFormSchema } from "../utils/validations";

export default function Login(): JSX.Element {
  const { onLoginSubmit } = useLoginFns();

  const initialValues: ILoginValues = {
    user: "",
    password: ""
  };

  return (
    <Formik
      validationSchema={LoginFormSchema}
      initialValues={initialValues}
      onSubmit={onLoginSubmit}>
      {({ values, handleChange }: FormikProps<ILoginValues>) => (
        <Form>
          <UIInputContainer>
            <UIInput
              placeholder="user@email.com"
              label="Username or Email"
              name="user"
              autoComplete="username"
              value={values.user}
              onChange={handleChange}
            />
            <ErrorMessage name="user" component={UIInputError} />
          </UIInputContainer>
          <UIInputContainer>
            <UIInput
              placeholder="*********"
              name="password"
              label="Password"
              value={values.password}
              type="password"
              autoComplete="current-password"
              onChange={handleChange}
            />
            <ErrorMessage name="password" component={UIInputError} />
          </UIInputContainer>
          <div className="u-right">
            <UIInputContainer style={{ display: "inline-block" }}>
              <Button type="submit">Login</Button>
            </UIInputContainer>
          </div>
        </Form>
      )}
    </Formik>
  );
}
