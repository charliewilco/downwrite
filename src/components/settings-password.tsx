import { useCallback, useReducer, ReducerWithoutAction } from "react";
import { useFormik, FormikHelpers } from "formik";
import base64 from "base-64";
import { MixedCheckbox } from "@reach/checkbox";
import UIInput, { UIInputContainer, UIInputError } from "./ui-input";
import SettingsBlock, { SettingsFormActions } from "./settings-block";
import { Button } from "./button";
import { UpdatePasswordSchema } from "@utils/validations";
import { NotificationType, useNotifications } from "@reducers/app";

import { useUpdatePasswordMutation } from "../__generated__/client";

interface IPasswordSettings {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function SettingsPassword(): JSX.Element {
  const [isOpen, onToggleOpen] = useReducer<ReducerWithoutAction<boolean>>(
    (prev: boolean) => !prev,
    false
  );
  const [mutationFn] = useUpdatePasswordMutation();
  const [, { addNotification }] = useNotifications();
  const onSubmit = useCallback(
    async (
      _: IPasswordSettings,
      actions: FormikHelpers<IPasswordSettings>
    ): Promise<void> => {
      try {
        await actions.validateForm();
        await mutationFn({
          variables: {
            current: base64.encode(_.oldPassword),
            newPassword: base64.encode(_.newPassword)
          }
        });
      } catch (err) {
        addNotification(err.message, NotificationType.ERROR, true);
      }
    },
    [addNotification, mutationFn]
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
        <UIInputContainer className="mb-4">
          <UIInput
            label="Old Password"
            name="oldPassword"
            type={!isOpen ? "password" : "text"}
            placeholder="*********"
            value={formik.values.oldPassword}
            onChange={formik.handleChange}
          />
          {formik.errors.oldPassword && (
            <UIInputError>{formik.errors.oldPassword}</UIInputError>
          )}
        </UIInputContainer>
        <UIInputContainer className="mb-4">
          <UIInput
            label="New Password"
            name="newPassword"
            type={!isOpen ? "password" : "text"}
            placeholder="*********"
            value={formik.values.newPassword}
            onChange={formik.handleChange}
          />
          {formik.errors.newPassword && (
            <UIInputError>{formik.errors.newPassword}</UIInputError>
          )}
        </UIInputContainer>

        <UIInputContainer className="mb-4">
          <UIInput
            label="Confirm Your New Password"
            name="confirmPassword"
            type={!isOpen ? "password" : "text"}
            placeholder="*********"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
          />
          {formik.errors.confirmPassword && (
            <UIInputError>{formik.errors.confirmPassword}</UIInputError>
          )}
        </UIInputContainer>

        <SettingsFormActions split>
          <div className="mr-4">
            <label className="text-xs flex items-center">
              <MixedCheckbox
                name="Password Hidden"
                checked={isOpen}
                onChange={onToggleOpen}
              />
              <span className="flex-1 ml-2 align-middle inline-block leading-none font-bold">
                {!isOpen ? "Values hidden" : "Values shown"}
              </span>
            </label>
          </div>
          <Button type="submit" disabled={formik.isSubmitting}>
            Save
          </Button>
        </SettingsFormActions>
      </form>
    </SettingsBlock>
  );
}
