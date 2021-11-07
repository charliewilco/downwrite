import { GlobalSettings } from "./settings";
import { Me } from "./me";
import { GlobalNotifications } from "./notifications";
import { EditorAction } from "./editor";
import { DownwriteClient } from "@store/client";
import { DashboardState } from "./dashboard";
import { CreateEntry } from "./create";
import { __IS_BROWSER__ } from "@utils/dev";

export interface IAppState {
  settings: GlobalSettings;
  me: Me;
  notifications: GlobalNotifications;
  editor: EditorAction;
  dashboard: DashboardState;
  create: CreateEntry;
}

export interface ILoginValues {
  user: string;
  password: string;
}

export class Store implements IAppState {
  settings: GlobalSettings;
  me: Me;
  notifications: GlobalNotifications;
  editor: EditorAction;
  create: CreateEntry;
  dashboard: DashboardState;
  isOffline: boolean = false;
  #client = new DownwriteClient();
  constructor() {
    this.me = new Me(this.#client, this);
    this.settings = new GlobalSettings(this.#client, this);
    this.notifications = new GlobalNotifications();
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
      this.isOffline = window.navigator.onLine;
    }
  }

  get authed() {
    return !!this.me.username && !!this.me.id;
  }

  get graphql() {
    return this.#client;
  }
}
