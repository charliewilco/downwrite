import * as React from "react";
import { Formik, FormikProps, ErrorMessage, Form, FormikActions } from "formik";
import UIInput, { UIInputContainer, UIInputError } from "./ui-input";
import SettingsBlock, { SettingsFormActions } from "./settings-block";
import { Button } from "./button";
import * as API from "../utils/api";
import { AuthContext, AuthContextType } from "./auth";
import { UserSettingsSchema } from "../utils/validations";

interface IUserFormValues {
  username: string;
  email: string;
}

interface ISettingsUserForm {
  user: IUserFormValues;
}

export default function SettingsUser(props: ISettingsUserForm): JSX.Element {
  const [{ token }] = React.useContext<AuthContextType>(AuthContext);
  const initialValues = React.useRef<IUserFormValues>({
    username: props.user.username,
    email: props.user.email
  });

  const onSubmit = async (
    values: IUserFormValues,
    actions: FormikActions<IUserFormValues>
  ): Promise<void> => {
    const { host } = document.location;
    const settings = await API.updateSettings(values, { token, host });
    if (settings) {
      actions.setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues.current}
      onSubmit={onSubmit}
      validationSchema={UserSettingsSchema}>
      {(formik: FormikProps<IUserFormValues>) => (
        <SettingsBlock title="User Settings">
          <Form>
            <UIInputContainer>
              <UIInput
                testID="SETTINGS_USERNAME_INPUT"
                placeholder="username"
                label="Username"
                name="username"
                autoComplete="username"
                value={formik.values.username}
                onChange={formik.handleChange}
              />
              <ErrorMessage name="username" component={UIInputError} />
            </UIInputContainer>
            <UIInputContainer>
              <UIInput
                testID="SETTINGS_EMAIL_INPUT"
                placeholder="user@email.com"
                label="Email"
                autoComplete="email"
                type="email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
              />
              <ErrorMessage name="email" component={UIInputError} />
            </UIInputContainer>
            <SettingsFormActions>
              <Button type="submit" disabled={formik.isSubmitting}>
                Save
              </Button>
            </SettingsFormActions>
          </Form>
        </SettingsBlock>
      )}
    </Formik>
  );
}
