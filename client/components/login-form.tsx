import * as React from "react";
import { Formik, Form, FormikProps, ErrorMessage } from "formik";
import UIInput, { UIInputError, UIInputContainer } from "./ui-input";
import Button from "./button";
import SpacedBox from "./spaced-box";
import * as API from "../utils/api";
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
    this.onSubmit(values);
  };

  private onSubmit = async (values: ILoginForm): Promise<void> => {
    const { signIn, setError } = this.props;
    const auth = await API.authUser(values);

    if (auth.error) {
      setError(auth.message, "error");
    }

    if (auth.token) {
      signIn(auth.token !== undefined, auth.token);
    }
  };

  public render(): JSX.Element {
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
