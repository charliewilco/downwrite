import * as React from "react";
import { Formik, FormikProps, ErrorMessage, Form, FormikActions } from "formik";
import UIInput, { UIInputContainer, UIInputError } from "./ui-input";
import SettingsBlock, { SettingsFormActions } from "./settings-block";
import Toggle from "./toggle";
import { ToggleBox } from "../components/toggle-box";
import Button from "./button";
import { IAuthContext, AuthContext } from "./auth";
import { UpdatePasswordSchema } from "../utils/validations";
import * as API from "../utils/api";

export interface StringTMap<T> {
  [key: string]: T;
}

interface IPasswordSettings extends StringTMap<string> {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface IInputs {
  name: string;
  label: string;
}

class SettingsPassword extends React.Component<{}, {}> {
  public static contextType: React.Context<IAuthContext> = AuthContext;

  private onSubmit = (
    values: IPasswordSettings,
    actions: FormikActions<IPasswordSettings>
  ): void => {
    const { token } = this.context;
    const { host } = document.location;
    const response = API.updatePassword(values, { token, host });

    if (response) {
      actions.setSubmitting(false);
    }
  };

  private inputs: IInputs[] = [
    {
      label: "Current Password",
      name: "oldPassword"
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

  public render(): JSX.Element {
    return (
      <Formik
        initialValues={{
          oldPassword: "",
          newPassword: "",
          confirmPassword: ""
        }}
        validationSchema={UpdatePasswordSchema}
        onSubmit={this.onSubmit}>
        {({
          values,
          handleChange,
          isSubmitting
        }: FormikProps<IPasswordSettings>) => (
          <SettingsBlock title="Password">
            <Toggle>
              {({ isOpen, onToggle }) => (
                <Form>
                  {this.inputs.map(({ name, label }: IInputs, idx) => (
                    <UIInputContainer key={idx}>
                      <UIInput
                        label={label}
                        name={name}
                        type={!isOpen ? "password" : "text"}
                        placeholder="*********"
                        value={values[name]}
                        onChange={handleChange}
                      />
                      <ErrorMessage name={name} component={UIInputError} />
                    </UIInputContainer>
                  ))}
                  <SettingsFormActions split>
                    <ToggleBox
                      label={value => (!value ? "Values hidden" : "Values shown")}
                      onChange={onToggle}
                      value={isOpen}
                    />
                    <Button type="submit" disabled={isSubmitting}>
                      Save
                    </Button>
                  </SettingsFormActions>
                </Form>
              )}
            </Toggle>
          </SettingsBlock>
        )}
      </Formik>
    );
  }
}

export default SettingsPassword;
