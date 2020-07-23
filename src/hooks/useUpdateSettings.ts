import { useCallback } from "react";
import { ApolloCache, FetchResult } from "@apollo/client";
import { FormikHelpers } from "formik";
import {
  useUpdateUserSettingsMutation,
  UserDetailsDocument,
  IUserDetailsQuery,
  IUpdateUserSettingsMutation
} from "@utils/generated";

export interface IUserFormValues {
  username: string;
  email: string;
}

function updateSettings(
  cache: ApolloCache<IUpdateUserSettingsMutation>,
  result: FetchResult<IUpdateUserSettingsMutation>
) {
  if (result.data) {
    cache.writeQuery<IUserDetailsQuery>({
      query: UserDetailsDocument,
      data: {
        settings: {
          username: result.data.updateUserSettings?.username!,
          email: result.data.updateUserSettings?.email!
        }
      }
    });
  }
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
            update: updateSettings
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
