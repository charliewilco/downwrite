import { GlobalSettings } from "./base/settings";
import { Me } from "./base/me";
import { GlobalNotifications } from "./base/notifications";
import { DownwriteClient } from "./client";

export interface IAppState {
  settings: GlobalSettings;
  me: Me;
  notifications: GlobalNotifications;
}

export interface IStoreContructor<T> {
  new (gql: DownwriteClient, store: IAppState): T;
}
