import * as React from "react";
import { Formik, FormikProps, Form } from "formik";
import SettingsBlock, { SettingsFormActions } from "./settings-block";
import UIInput, { UIInputContainer } from "./ui-input";
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

  render() {
    return (
      <Formik
        initialValues={initialValues}
        validationSchema={UpdatePasswordSchema}
        onSubmit={this.onSubmit}>
        {({ values, handleChange }: FormikProps<IPasswordSettings>) => (
          <SettingsBlock title="Password">
            <Form>
              <UIInputContainer>
                <UIInput
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  placeholder="*********"
                  value={values.currentPassword}
                  onChange={handleChange}
                />
              </UIInputContainer>
              <UIInputContainer>
                <UIInput
                  label="New Password"
                  name="newPassword"
                  type="password"
                  placeholder="*********"
                  value={values.newPassword}
                  onChange={handleChange}
                />
              </UIInputContainer>
              <UIInputContainer>
                <UIInput
                  label="Confirm Your New Password"
                  name="confirmPassword"
                  type="password"
                  placeholder="*********"
                  value={values.confirmPassword}
                  onChange={handleChange}
                />
              </UIInputContainer>
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
