import { useCallback } from "react";
import { useRouter } from "next/router";
import decode from "jwt-decode";
import base64 from "base-64";
import Cookies from "universal-cookie";
import { useNotifications, NotificationType, useCurrentUser } from "@reducers/app";
import { TOKEN_NAME } from "@lib/constants";
import { TokenContents } from "@lib/token";
import { Routes } from "@utils/routes";
import { dwClient } from "@lib/client";

export interface IRegisterValues extends Record<string, string | boolean> {
  username: string;
  password: string;
  legalChecked: boolean;
  email: string;
}

export interface ILoginValues extends Record<string, string> {
  user: string;
  password: string;
}

interface IFormHandlers {
  onLoginSubmit(values: ILoginValues): void;
  onRegisterSubmit(values: IRegisterValues): void;
}
const cookies = new Cookies();

export function useLoginFns(): IFormHandlers {
  const router = useRouter();
  const [notifications, { addNotification, removeNotification }] =
    useNotifications();
  const [, { onCurrentUserLogin }] = useCurrentUser();

  const onSuccess = useCallback((token: string) => {
    const d = decode<TokenContents>(token);
    cookies.set(TOKEN_NAME, token);
    onCurrentUserLogin(d.name, d.user);

    router.push(Routes.DASHBOARD);

    if (notifications.length > 0) {
      notifications.forEach((n) => {
        removeNotification(n);
      });
    }
  }, []);

  const onLoginSubmit = useCallback(
    async (values: ILoginValues): Promise<void> => {
      await dwClient
        .LoginUser({
          username: values.user,
          password: base64.encode(values.password)
        })
        .then((value) => {
          if (value?.authenticateUser?.token) {
            const token = value.authenticateUser.token;
            onSuccess(token);
          }
        })
        .catch((error) => {
          addNotification(error.message, NotificationType.ERROR);
        });
    },
    [addNotification, onSuccess]
  );

  const onRegisterSubmit = useCallback(
    async ({ legalChecked, ...values }: IRegisterValues): Promise<void> => {
      if (legalChecked) {
        await dwClient
          .CreateUser({
            ...values,
            password: base64.encode(values.password)
          })
          .then((value) => {
            if (value?.createUser?.token) {
              const token = value.createUser.token;

              onSuccess(token);
            }
          })
          .catch((error) => {
            addNotification(error.message, NotificationType.ERROR);
          });
      }
    },
    [addNotification, onSuccess]
  );

  return {
    onLoginSubmit,
    onRegisterSubmit
  };
}
