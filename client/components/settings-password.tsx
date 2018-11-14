import * as React from "react";
import { Formik, FormikProps, ErrorMessage, Form } from "formik";
import UIInput, { UIInputContainer, UIInputError } from "./ui-input";
import SettingsBlock, { SettingsFormActions } from "./settings-block";
import Button from "./button";
import { UpdatePasswordSchema } from "../utils/validations";

interface IPasswordSettings {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ISettingsFormProps {
  onSubmit: (settings: IPasswordSettings) => void;
}

const initialValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: ""
};

export default class SettingsLocalMarkdown extends React.Component<
  ISettingsFormProps,
  {}
> {
  onSubmit(values, actions) {
    this.props.onSubmit(values);
  }

  private inputs = [
    {
      label: "Current Password",
      name: "currentPassword"
    },
    {
      label: "New Password",
      name: "newPassword"
    },
    {
      label: "Confirm Your New Password",
      name: "confirmPassword"
    }
  ];

  render() {
    return (
      <Formik
        initialValues={initialValues}
        validationSchema={UpdatePasswordSchema}
        onSubmit={this.onSubmit}>
        {({ values, handleChange }: FormikProps<IPasswordSettings>) => (
          <SettingsBlock title="Password">
            <Form>
              {this.inputs.map((input, idx) => (
                <UIInputContainer key={idx}>
                  <UIInput
                    label={input.label}
                    name={input.name}
                    type="password"
                    placeholder="*********"
                    value={values[input.name]}
                    onChange={handleChange}
                  />
                  <ErrorMessage name={input.name} component={UIInputError} />
                </UIInputContainer>
              ))}
              <SettingsFormActions>
                <Button type="submit">Save</Button>
              </SettingsFormActions>
            </Form>
          </SettingsBlock>
        )}
      </Formik>
    );
  }
}
