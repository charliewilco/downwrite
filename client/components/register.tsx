import * as React from "react";
import { Formik, Form, FormikProps, ErrorMessage } from "formik";
import "isomorphic-fetch";
import UIInput, { UIInputError, UIInputContainer } from "./ui-input";
import Button from "./button";
import SpacedBox from "./spaced-box";
import LegalBoilerplate from "./legal-boilerplate";
import * as API from "../utils/api";
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

export default class Register extends React.Component<LoginProps, {}> {
  handleSubmit = (values, actions) => {
    if (values.legalChecked) {
      this.onSubmit(values);
    }
  };

  onSubmit = async ({ username, email, password }: IRegistration): Promise<void> => {
    const { signIn, setError } = this.props;

    const user = await API.createUser({ username, email, password });

    if (user.userID) {
      signIn(user.id_token !== undefined, user.id_token);
    } else {
      setError(user.message, "error");
    }
  };

  private inputs = [
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
        {({ values, handleChange }: FormikProps<IRegistration>) => (
          <Form>
            <SpacedBox>
              {this.inputs.map(input => (
                <UIInputContainer key={input.name}>
                  <UIInput
                    placeholder={input.placeholder}
                    label={input.label}
                    autoComplete={input.autoComplete}
                    name={input.name}
                    value={values[input.name]}
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
  }
}
