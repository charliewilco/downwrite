import { useState, useCallback } from "react";
import { useFormik, FormikHelpers } from "formik";
import UIInput, { UIInputContainer, UIInputError } from "./ui-input";
import SettingsBlock, { SettingsFormActions } from "./settings-block";
import { ToggleBox } from "../components/toggle-box";
import { Button } from "./button";
import { useAuthContext } from "./auth";
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
  const [{ token }] = useAuthContext();
  const [isOpen, setOpen] = useState(false);

  const onSubmit = useCallback(
    (values: IPasswordSettings, actions: FormikHelpers<IPasswordSettings>): void => {
      const { host } = document.location;
      const response = API.updatePassword(values, { token, host });

      if (response) {
        actions.setSubmitting(false);
      }
    },
    []
  );

  const initialValues: IPasswordSettings = {
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  };

  const formik = useFormik<IPasswordSettings>({
    initialValues,
    onSubmit,
    validationSchema: UpdatePasswordSchema
  });

  return (
    <SettingsBlock title="Password">
      <form onSubmit={formik.handleSubmit}>
        {PASSWORD_INPUTS.map(({ name, label }: IInputs, idx) => (
          <UIInputContainer key={idx}>
            <UIInput
              label={label}
              name={name}
              type={!isOpen ? "password" : "text"}
              placeholder="*********"
              value={formik.values[name]}
              onChange={formik.handleChange}
            />
            {formik.errors[name] && (
              <UIInputError>{formik.errors[name]}</UIInputError>
            )}
          </UIInputContainer>
        ))}
        <SettingsFormActions split>
          <ToggleBox
            label={value => (!value ? "Values hidden" : "Values shown")}
            onChange={() => setOpen(prevIsOpen => !prevIsOpen)}
            value={isOpen}
          />
          <Button type="submit" disabled={formik.isSubmitting}>
            Save
          </Button>
        </SettingsFormActions>
      </form>
    </SettingsBlock>
  );
}