import { makeAutoObservable } from "mobx";
import { DownwriteClient } from "@reducers/client";
import { IAppState } from "./store";

export interface IPartialFeedItem {
  id: string;
  title: string;
}

export class DashboardState {
  selected: null | IPartialFeedItem = null;
  #client: DownwriteClient;
  #store: IAppState;
  constructor(_graphql: DownwriteClient, store: IAppState) {
    makeAutoObservable(this);
    this.#client = _graphql;
    this.#store = store;
  }

  selectEntry(value: IPartialFeedItem) {
    this.selected = value;
  }

  cancel() {
    this.selected = null;
  }

  getFeed() {
    return this.#client.allPosts();
  }

  async remove(id: string) {
    try {
      const value = this.#client.removeEntry(id);
      return value;
    } catch (error) {
      this.#store.notifications.error(error.message, true);
    }
  }
}
