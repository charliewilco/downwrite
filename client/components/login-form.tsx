import * as React from "react";
import { Formik, Form, FormikProps, ErrorMessage, FormikActions } from "formik";
import UIInput, { UIInputError, UIInputContainer } from "./ui-input";
import { ErrorStateContext, IUIErrorMessage } from "./ui-error";
import { AuthContext, IAuthContext } from "./auth";
import { Button } from "./button";
import * as API from "../utils/api";
import { LoginFormSchema } from "../utils/validations";

interface ILoginForm {
  user: string;
  password: string;
}

export default function Login(): JSX.Element {
  const {
    errorActions: { setError }
  } = React.useContext<IUIErrorMessage>(ErrorStateContext);
  const { signIn } = React.useContext<IAuthContext>(AuthContext);
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
      setError(auth.message, "error");
    }

    if (auth.token) {
      signIn(auth.token !== undefined, auth.token);
    }
  };

  const initialValues: ILoginForm = {
    user: "",
    password: ""
  };

  return (
    <div className="SpacedBox">
      <Formik
        validationSchema={LoginFormSchema}
        initialValues={initialValues}
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
            <div className="u-right" style={{ padding: 16 }}>
              <UIInputContainer style={{ display: "inline-block" }}>
                <Button type="submit">Login</Button>
              </UIInputContainer>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
