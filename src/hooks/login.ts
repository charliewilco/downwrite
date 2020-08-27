import * as React from "react";
import { AuthContext, AuthContextType } from "../components/auth";
import { useUINotifications, NotificationType } from "../reducers/notifications";
import { authUser, createUser } from "../utils/api";
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
  const { notifications, actions } = useUINotifications();

  const onLoginSubmit = async (values: ILoginValues): Promise<void> => {
    const auth = await authUser(values);

    if (auth.error) {
      actions.add(auth.message, NotificationType.ERROR);
    }

    if (auth.token) {
      signIn(auth.token !== undefined, auth.token);
      if (notifications.length > 0) {
        notifications.forEach(n => {
          actions.remove(n);
        });
      }
    }
  };

  const onRegisterSubmit = async (values: IRegisterValues): Promise<void> => {
    const { legalChecked, ...body } = values;
    if (legalChecked) {
      const user = await createUser(body);

      if (user.userID) {
        signIn(user.id_token !== undefined, user.id_token);
      } else {
        actions.add(user.message!, NotificationType.ERROR);
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
