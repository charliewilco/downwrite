import { DownwriteClient } from "@store/client";
import { Me, GlobalNotifications, GlobalSettings } from "@store/base";
import { __IS_BROWSER__ } from "@utils/dev";
import type { IAppState, IStoreContructor } from "./types";

export class Store implements IAppState {
  settings: GlobalSettings;
  me: Me;
  notifications: GlobalNotifications;
  isOffline: boolean = false;
  #client = new DownwriteClient();
  constructor() {
    this.me = new Me(this.#client, this);
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
