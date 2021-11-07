import { makeObservable, computed, observable, runInAction } from "mobx";

import { Settings } from "./settings";
import { Me } from "./me";
import { Notifications } from "./notifications";
import { EditorAction } from "./editor";
import { DownwriteClient } from "@reducers/client";
import { DashboardState } from "./dashboard";
import { CreateEntry } from "./create";
import { __IS_BROWSER__ } from "@utils/dev";

export interface IAppState {
  settings: Settings;
  me: Me;
  notifications: Notifications;
  editor: EditorAction;
  dashboard: DashboardState;
  create: CreateEntry;
}

export interface ILoginValues {
  user: string;
  password: string;
}

export class Store implements IAppState {
  settings: Settings;
  me: Me;
  notifications: Notifications;
  editor: EditorAction;
  create: CreateEntry;
  dashboard: DashboardState;
  isOffline: boolean = false;
  #client = new DownwriteClient();
  constructor() {
    makeObservable(this, {
      authed: computed,
      isOffline: observable
    });

    this.me = new Me(this.#client, this);
    this.settings = new Settings(this.#client, this);
    this.notifications = new Notifications();
    this.editor = new EditorAction(this.#client, this);
    this.dashboard = new DashboardState(this.#client, this);
    this.create = new CreateEntry(this.#client, this);

    if (__IS_BROWSER__) {
      window.addEventListener("offline", this.handleOfflineChange);
      window.addEventListener("online", this.handleOfflineChange);
    }
  }

  handleOfflineChange() {
    if (__IS_BROWSER__) {
      runInAction(() => {
        this.isOffline = window.navigator.onLine;
      });
    }
  }

  get authed() {
    return !!this.me.username && !!this.me.id;
  }

  get graphql() {
    return this.#client;
  }
}
