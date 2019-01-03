import * as React from "react";
import { Formik, FormikProps, ErrorMessage, Form, FormikActions } from "formik";
import UIInput, { UIInputContainer, UIInputError } from "./ui-input";
import SettingsBlock, { SettingsFormActions } from "./settings-block";
import Button from "./button";
import * as API from "../utils/api";
import { AuthContext, IAuthContext } from "./auth";
import { UserSettingsSchema } from "../utils/validations";

interface IUserFormValues {
  username: string;
  email: string;
}

interface ISettingsUserForm {
  user: IUserFormValues;
}

class SettingsUser extends React.Component<ISettingsUserForm, {}> {
  static contextType: React.Context<IAuthContext> = AuthContext;
  onSubmit = async (
    values: IUserFormValues,
    actions: FormikActions<IUserFormValues>
  ) => {
    const { token } = this.context;
    const { host } = document.location;
    const settings = await API.updateSettings(values, { token, host });
    if (settings) {
      actions.setSubmitting(false);
    }
  };

  render() {
    const { user } = this.props;
    return (
      <Formik
        initialValues={{ username: user.username, email: user.email }}
        onSubmit={this.onSubmit}
        validationSchema={UserSettingsSchema}>
        {({ values, handleChange, isSubmitting }: FormikProps<IUserFormValues>) => (
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
                <ErrorMessage name="username" component={UIInputError} />
              </UIInputContainer>
              <UIInputContainer>
                <UIInput
                  placeholder="user@email.com"
                  label="Email"
                  autoComplete="email"
                  type="email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                />
                <ErrorMessage name="email" component={UIInputError} />
              </UIInputContainer>
              <SettingsFormActions>
                <Button type="submit" disabled={isSubmitting}>
                  Save
                </Button>
              </SettingsFormActions>
            </Form>
          </SettingsBlock>
        )}
      </Formik>
    );
  }
}

export default SettingsUser;
