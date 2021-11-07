import decode from "jwt-decode";
import base64 from "base-64";

import { TokenContents } from "@lib/token";
import { IIsMeQuery } from "../__generated__/client";
import { DownwriteClient } from "@store/client";
import { IAppState } from "./store";
import { BehaviorSubject } from "rxjs";

export interface ICurrentUserState {
  username?: string;
  id?: string;
  authed: boolean;
}

export interface IRegisterValues {
  username: string;
  password: string;
  legalChecked: boolean;
  email: string;
}

export interface ILoginValues {
  user: string;
  password: string;
}

export class Me {
  username = "";
  id = "";
  readonly state = new BehaviorSubject<ICurrentUserState>({
    username: "",
    id: "",
    authed: false
  });
  #client: DownwriteClient;
  #store: IAppState;
  constructor(_graphql: DownwriteClient, store: IAppState) {
    this.#client = _graphql;
    this.#store = store;
  }

  checkAuth(value: IIsMeQuery) {
    this.id = value.me.details.id;
    this.username = value.me.token;
  }

  onLogin(username: string, id: string) {
    this.username = username;
    this.id = id;
  }

  onLogout() {
    this.username = "";
    this.id = "";
  }

  async login(values: ILoginValues) {
    try {
      const value = await this.#client.loginUser({
        username: values.user,
        password: base64.encode(values.password)
      });

      const token = value.authenticateUser.token;

      const d = decode<TokenContents>(token);
      this.onLogin(d.name, d.user);
      this.#client.setToken(token);

      for (const n of this.#store.notifications.getAll()) {
        this.#store.notifications.remove(n.id);
      }
    } catch (error) {
      this.#store.notifications.error(error.message);
    }
  }

  async register({ legalChecked, ...values }: IRegisterValues) {
    if (legalChecked) {
      try {
        const value = await this.#client.createUser({
          ...values,
          password: base64.encode(values.password)
        });

        if (value.createUser.token) {
          const token = value.createUser.token;

          const d = decode<TokenContents>(token);
          this.onLogin(d.name, d.user);
          this.#client.setToken(token);

          for (const n of this.#store.notifications.getAll()) {
            this.#store.notifications.remove(n.id);
          }
        }
      } catch (error) {
        this.#store.notifications.error(error.message);
      }
    }
  }
}
