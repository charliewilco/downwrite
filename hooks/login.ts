import * as React from "react";
import { AuthContext, AuthContextType } from "../components/auth";
import { useUINotifications, NotificationType } from "../reducers/notifications";
import * as API from "../utils/api";
import { StringTMap } from "../utils/types";

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

export default function useLoginFns(): IFormHandlers {
  const [, { signIn }] = React.useContext<AuthContextType>(AuthContext);
  const [{ notifications }, actions] = useUINotifications();

  const onLoginSubmit = async (values: ILoginValues): Promise<void> => {
    const { host } = document.location;
    const auth = await API.authUser(values, { host });

    if (auth.error) {
      actions.addNotification(auth.message, NotificationType.ERROR);
    }

    if (auth.token) {
      signIn(auth.token !== undefined, auth.token);
      if (notifications.length > 0) {
        notifications.forEach(n => {
          actions.removeNotification(n);
        });
      }
    }
  };

  const onRegisterSubmit = async (values: IRegisterValues): Promise<void> => {
    const { legalChecked, ...body } = values;
    const { host } = document.location;
    if (legalChecked) {
      const user = await API.createUser(body, {
        host
      });

      if (user.userID) {
        signIn(user.id_token !== undefined, user.id_token);
      } else {
        actions.addNotification(user.message, NotificationType.ERROR);
      }
    }
  };

  return {
    onLoginSubmit(values) {
      onLoginSubmit(values);
    },
    onRegisterSubmit(values) {
      if (values.legalChecked) {
        onRegisterSubmit(values);
      }
    }
  };
}
