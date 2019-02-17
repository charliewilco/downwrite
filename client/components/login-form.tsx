import * as React from "react";
import { Formik, Form, FormikProps, ErrorMessage, FormikActions } from "formik";
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

const Login: React.FC<LoginProps> = function(props) {
  const handleFormSubmit = (
    values: ILoginForm,
    actions: FormikActions<ILoginForm>
  ): void => {
    onSubmit(values);
  };

  const onSubmit = async (values: ILoginForm): Promise<void> => {
    const { host } = document.location;
    const auth = await API.authUser(values, { host });

    if (auth.error) {
      props.setError(auth.message, "error");
    }

    if (auth.token) {
      props.signIn(auth.token !== undefined, auth.token);
    }
  };

  return (
    <SpacedBox>
      <Formik
        validationSchema={LoginFormSchema}
        initialValues={{
          user: "",
          password: ""
        }}
        onSubmit={handleFormSubmit}>
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
};

export default Login;
