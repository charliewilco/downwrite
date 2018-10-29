import * as React from "react";
import { Formik, Form, FormikProps, ErrorMessage } from "formik";
import "universal-fetch";
import LoginInput, { LoginInputContainer } from "./login-input";
import InputError from "./input-error";
import Button from "./button";
import SpacedBox from "./spaced-box";
import LegalBoilerplate from "./legal-boilerplate";
import { USER_ENDPOINT } from "../utils/urls";
import { RegisterFormSchema } from "../utils/validations";

interface IRegistration {
  username: string;
  password: string;
  legalChecked: boolean;
  email: string;
}

interface LoginProps {
  signIn: (x: boolean, y: string) => void;
  setError: (x: string, y: string) => void;
}
interface IUserResponse {
  userID: string;
  id_token: string;
  username: string;
  message?: string;
}

export default class Register extends React.Component<LoginProps, {}> {
  handleSubmit = (values, actions) => {
    console.log(actions);
    if (values.legalChecked) {
      this.onSubmit(values);
    }
  };

  onSubmit = async ({ username, email, password }: IRegistration): Promise<void> => {
    const { signIn, setError } = this.props;

    const user: IUserResponse = await fetch(USER_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, email, password })
    }).then(res => res.json());

    if (user.userID) {
      signIn(user.id_token !== undefined, user.id_token);
    } else {
      setError(user.message, "error");
    }
  };

  render() {
    return (
      <Formik
        validationSchema={RegisterFormSchema}
        initialValues={{
          legalChecked: false,
          username: "",
          password: "",
          email: ""
        }}
        onSubmit={this.handleSubmit}>
        {({ values, errors, handleChange }: FormikProps<IRegistration>) => (
          <Form>
            <SpacedBox>
              <LoginInputContainer>
                <LoginInput
                  placeholder="Try for something unique"
                  label="Username"
                  autoComplete="username"
                  name="username"
                  value={values.username}
                  onChange={handleChange}
                />
                <ErrorMessage name="username" component={InputError} />
              </LoginInputContainer>
              <LoginInputContainer>
                <LoginInput
                  placeholder="mail@email.com"
                  label="Email"
                  autoComplete="email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                />
                <ErrorMessage name="email" component={InputError} />
              </LoginInputContainer>
              <LoginInputContainer>
                <LoginInput
                  placeholder="*********"
                  label="Password"
                  name="password"
                  value={values.password}
                  autoComplete="current-password"
                  type="password"
                  onChange={handleChange}
                />
                <ErrorMessage name="password" component={InputError} />
              </LoginInputContainer>
            </SpacedBox>
            <LegalBoilerplate
              name="legalChecked"
              checked={values.legalChecked}
              onChange={handleChange}
            />
            <SpacedBox align="right">
              <LoginInputContainer style={{ display: "inline-block" }}>
                <Button disabled={!values.legalChecked} type="submit">
                  Register
                </Button>
              </LoginInputContainer>
            </SpacedBox>
          </Form>
        )}
      </Formik>
    );
  }
}
