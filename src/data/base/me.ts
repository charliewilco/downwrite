import decode from "jwt-decode";
import base64 from "base-64";
import { BehaviorSubject } from "rxjs";

import { DownwriteClient } from "src/data/client";
import type { IAppState } from "src/data/types";
import type { TokenContents } from "src/shared/types";
import type { IIsMeQuery } from "../../__generated__/client";

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
  #internalState: ICurrentUserState = {
    username: "",
    id: "",
    authed: false
  };
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
    this.#internalState.id = value.me.details.id;
    this.#internalState.username = value.me.details.username;

    this.state.next({
      ...this.#internalState,
      authed: !!this.#internalState.username && !!this.#internalState.id
    });
  }

  onLogin(username: string, id: string) {
    this.#internalState.username = username;
    this.#internalState.id = id;

    this.state.next({
      ...this.#internalState,
      authed: !!this.#internalState.username && !!this.#internalState.id
    });
  }

  onLogout() {
    this.#internalState.username = "";
    this.#internalState.id = "";

    this.state.next({
      ...this.#internalState,
      authed: !!this.#internalState.username && !!this.#internalState.id
    });
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
