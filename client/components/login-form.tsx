import * as React from "react";
import { Formik, Form, FormikProps, ErrorMessage } from "formik";
import UIInput, { UIInputError, UIInputContainer } from "./ui-input";
import Button from "./button";
import SpacedBox from "./spaced-box";
import { AUTH_ENDPOINT } from "../utils/urls";
import { LoginFormSchema } from "../utils/validations";

interface ILoginForm {
  user: string;
  password: string;
}

interface LoginProps {
  signIn: (authed: boolean, token: string) => void;
  setError: (x: string, y: string) => void;
}

export default class Login extends React.Component<LoginProps, {}> {
  handleSubmit = (values, actions) => {
    console.log("HANDLING SUBMIT");
    this.onSubmit(values);
  };

  onSubmit = async (values: ILoginForm) => {
    const { signIn, setError } = this.props;
    const auth = await fetch(AUTH_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ...values })
    }).then(res => res.json());

    if (auth.error) {
      setError(auth.message, "error");
    }

    if (auth.token) {
      signIn(auth.token !== undefined, auth.token);
    }
  };

  render() {
    return (
      <SpacedBox>
        <Formik
          validationSchema={LoginFormSchema}
          initialValues={{
            user: "",
            password: ""
          }}
          onSubmit={this.handleSubmit}>
          {({
            values,
            errors,
            handleChange,
            handleSubmit
          }: FormikProps<ILoginForm>) => (
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
              <SpacedBox align="right">
                <UIInputContainer style={{ display: "inline-block" }}>
                  <Button type="submit">Login</Button>
                </UIInputContainer>
              </SpacedBox>
            </Form>
          )}
        </Formik>
      </SpacedBox>
    );
  }
}
