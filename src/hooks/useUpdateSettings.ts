import { useCallback } from "react";
import { FormikHelpers } from "formik";
import { useUpdateUserSettingsMutation } from "@utils/generated";
import { updateSettingsCache } from "@utils/cache";

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
