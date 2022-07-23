import { GlobalSettings } from "./base/settings";
import { Auth } from "./base/auth";
import { GlobalNotifications } from "./base/notifications";
import { APIClient } from "./client";

export interface IAppState {
  settings: GlobalSettings;
  auth: Auth;
  notifications: GlobalNotifications;
}

export interface IStoreContructor<T> {
  new (gql: APIClient, store: IAppState): T;
}
