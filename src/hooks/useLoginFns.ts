import { useCallback } from "react";
import { useAuthContext } from "../components/auth";
import { useUINotifications, NotificationType } from "../reducers/notifications";
import { StringTMap } from "../utils/types";
import { useLoginUserMutation, useCreateUserMutation } from "../utils/generated";

export interface IRegisterValues extends StringTMap<string | boolean> {
  username: string;
  password: string;
  legalChecked: boolean;
  email: string;
}

export interface ILoginValues extends StringTMap<string> {
  user: string;
  password: string;
}

interface IFormHandlers {
  onLoginSubmit: (values: ILoginValues) => void;
  onRegisterSubmit: (values: IRegisterValues) => void;
}

export function useLoginFns(): IFormHandlers {
  const [, { signIn }] = useAuthContext();
  const [
    { notifications },
    { addNotification, removeNotification }
  ] = useUINotifications();
  const [createUser] = useCreateUserMutation();

  const [authenticateUser] = useLoginUserMutation();

  const onLoginSubmit = useCallback(
    async (values: ILoginValues): Promise<void> => {
      await authenticateUser({
        variables: {
          username: values.user,
          password: values.password
        }
      })
        .then(value => {
          if (value?.data?.authenticateUser?.token) {
            const token = value.data.authenticateUser.token;
            signIn(token !== undefined, token);

            if (notifications.length > 0) {
              notifications.forEach(n => {
                removeNotification(n);
              });
            }
          }
        })
        .catch(error => {
          addNotification(error.message, NotificationType.ERROR);
        });
    },
    [addNotification, removeNotification, notifications, signIn, authenticateUser]
  );

  const onRegisterSubmit = useCallback(
    async (values: IRegisterValues): Promise<void> => {
      if (values.legalChecked) {
        await createUser({
          variables: {
            email: values.email,
            username: values.username,
            password: values.password
          }
        })
          .then(value => {
            const token = value.data?.createUser?.token;

            signIn(token !== undefined, token!);
          })
          .catch(error => {
            addNotification(error.message, NotificationType.ERROR);
          });
      }
    },
    [createUser, addNotification, signIn]
  );

  return {
    onLoginSubmit,
    onRegisterSubmit
  };
}
