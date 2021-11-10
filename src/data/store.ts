import { DownwriteClient } from "@data/client";
import { Auth, GlobalNotifications, GlobalSettings } from "@data/base";
import { __IS_BROWSER__ } from "@shared/constants";
import type { IAppState, IStoreContructor } from "./types";

export class DownwriteUIState implements IAppState {
  settings: GlobalSettings;
  auth: Auth;
  notifications: GlobalNotifications;
  isOffline: boolean = false;
  #client = new DownwriteClient();
  constructor() {
    this.auth = new Auth(this.#client, this);
    this.settings = new GlobalSettings(this.#client, this);
    this.notifications = new GlobalNotifications();

    if (__IS_BROWSER__) {
      window.addEventListener("offline", this.handleOfflineChange);
      window.addEventListener("online", this.handleOfflineChange);
    }
  }

  handleOfflineChange() {
    if (__IS_BROWSER__) {
      this.isOffline = window.navigator.onLine;
    }
  }

  get graphql() {
    return this.#client;
  }

  createConnectedStore<T>(Cntor: IStoreContructor<T>) {
    return new Cntor(this.#client, this);
  }
}
