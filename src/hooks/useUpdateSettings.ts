import { useCallback } from "react";
import { FormikHelpers } from "formik";
import { dwClient } from "@lib/client";

export interface IUserFormValues {
  username: string;
  email: string;
}

export function useUpdateSettings() {
  const onSubmit = useCallback(
    async (
      settings: IUserFormValues,
      actions: FormikHelpers<IUserFormValues>
    ): Promise<void> => {
      if (settings) {
        try {
          await dwClient.UpdateUserSettings({
            settings: {
              username: settings.username,
              email: settings.email
            }
          });
          actions.setSubmitting(false);
        } catch (err) {
          console.log(err);
        }
      }
    },
    []
  );

  return onSubmit;
}
