import { useCallback } from "react";
import { FormikHelpers } from "formik";
import { updateSettingsCache } from "@utils/cache";
import { useUpdateUserSettingsMutation } from "../__generated__/client";

export interface IUserFormValues {
  username: string;
  email: string;
}

export function useUpdateSettings() {
  const [mutationFn] = useUpdateUserSettingsMutation();
  const onSubmit = useCallback(
    async (
      settings: IUserFormValues,
      actions: FormikHelpers<IUserFormValues>
    ): Promise<void> => {
      if (settings) {
        try {
          await mutationFn({
            variables: { settings },
            update: updateSettingsCache
          });
          actions.setSubmitting(false);
        } catch (err) {
          console.log(err);
        }
      }
    },
    [mutationFn]
  );

  return onSubmit;
}
