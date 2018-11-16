import * as React from "react";
import { Formik, FormikProps, ErrorMessage, Form } from "formik";
import UIInput, { UIInputContainer, UIInputError } from "./ui-input";
import SettingsBlock, { SettingsFormActions } from "./settings-block";
import Button from "./button";
import * as API from "../utils/api";
import { withAuth } from "./auth";

interface IUserFormValues {
  username: string;
  email: string;
}

interface ISettingsUserForm {
  user: IUserFormValues;
  token: string;
}

class SettingsUser extends React.Component<ISettingsUserForm, {}> {
  onSubmit = async (values, actions) => {
    const { token } = this.props;
    const settings = API.updateSettings(values, { token });
    if (settings) {
      actions.setSubmitting(false);
    }
  };

  render() {
    const { user } = this.props;
    return (
      <Formik
        initialValues={{ username: user.username, email: user.email }}
        onSubmit={this.onSubmit}>
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

export default withAuth(SettingsUser);
