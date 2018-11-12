import * as React from "react";
import { Formik, FormikProps, Form } from "formik";
import SettingsBlock, { SettingsFormActions } from "./settings-block";
import UIInput, { UIInputContainer } from "./ui-input";
import Button from "./button";

interface IUserFormValues {
  username: string;
  email: string;
}

interface ISettingsUserForm {
  onSubmit: () => void;
  user: IUserFormValues;
}

const SettingsUser: React.SFC<ISettingsUserForm> = ({ user, onSubmit }) => (
  <Formik
    initialValues={{ username: user.username, email: user.email }}
    onSubmit={onSubmit}>
    {({ values, handleChange }: FormikProps<IUserFormValues>) => (
      <SettingsBlock title="User Settings">
        <Form>
          <UIInputContainer>
            <UIInput
              placeholder="user@email.com"
              label="Username"
              name="username"
              autoComplete="username"
              value={values.username}
              onChange={handleChange}
            />
          </UIInputContainer>
          <UIInputContainer>
            <UIInput
              placeholder="user@email.com"
              label="Email"
              autoComplete="email"
              name="email"
              value={values.email}
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

export default SettingsUser;
