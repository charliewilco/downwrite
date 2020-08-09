import * as React from "react";
import { Formik, FormikProps, ErrorMessage, Form, FormikActions } from "formik";
import UIInput, { UIInputContainer, UIInputError } from "./ui-input";
import SettingsBlock, { SettingsFormActions } from "./settings-block";
import { ToggleBox } from "../components/toggle-box";
import { Button } from "./button";
import { AuthContext, AuthContextType } from "./auth";
import { UpdatePasswordSchema } from "../utils/validations";
import * as API from "../utils/api";
import { StringTMap } from "../utils/types";

interface IPasswordSettings extends StringTMap<string> {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface IInputs {
  name: string;
  label: string;
}

const PASSWORD_INPUTS: IInputs[] = [
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

export default function SettingsPassword(): JSX.Element {
  const [{ token }] = React.useContext<AuthContextType>(AuthContext);
  const [isOpen, setOpen] = React.useState(false);

  const onSubmit = (
    values: IPasswordSettings,
    actions: FormikActions<IPasswordSettings>
  ): void => {
    const { host } = document.location;
    const response = API.updatePassword(values, { token, host });

    if (response) {
      actions.setSubmitting(false);
    }
  };

  const initialValues: IPasswordSettings = {
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={UpdatePasswordSchema}
      onSubmit={onSubmit}>
      {({ values, handleChange, isSubmitting }: FormikProps<IPasswordSettings>) => (
        <SettingsBlock title="Password">
          <Form>
            {PASSWORD_INPUTS.map(({ name, label }: IInputs, idx) => (
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
                onChange={() => setOpen(!isOpen)}
                value={isOpen}
              />
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
