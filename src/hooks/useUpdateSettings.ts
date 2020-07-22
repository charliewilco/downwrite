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
  { data }: FetchResult<IUpdateUserSettingsMutation>
) {
  if (data) {
    cache.writeQuery<IUserDetailsQuery>({
      query: UserDetailsDocument,
      data: {
        settings: {
          username: data.updateUserSettings?.username!,
          email: data.updateUserSettings?.email!
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
        await mutationFn({
          variables: { settings },
          update: updateSettings
        }).catch(err => console.log(err));
        actions.setSubmitting(false);
      }
    },
    [mutationFn]
  );

  return onSubmit;
}
