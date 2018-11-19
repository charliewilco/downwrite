import * as React from "react";
import { Formik, FormikProps, ErrorMessage, Form } from "formik";
import UIInput, { UIInputContainer, UIInputError } from "./ui-input";
import SettingsBlock, { SettingsFormActions } from "./settings-block";
import Toggle from "./toggle";
import { ToggleBox } from "../components/toggle-box";
import Button from "./button";
import { withAuth } from "./auth";
import { UpdatePasswordSchema } from "../utils/validations";
import * as API from "../utils/api";

interface IPasswordSettings {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

class SettingsPassword extends React.Component<{ token: string }, {}> {
  onSubmit = (values, actions) => {
    const { token } = this.props;
    const response = API.updatePassword(values, { token });

    if (response) {
      actions.setSubmitting(false);
    }
  };

  private inputs = [
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

  render() {
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
                  {this.inputs.map(({ name, label }, idx) => (
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

export default withAuth(SettingsPassword);
