import decode from "jwt-decode";
import base64 from "base-64";
import { BehaviorSubject } from "rxjs";

import { APIClient } from "@data/client";
import type { IAppState } from "@data/types";
import { TOKEN_NAME } from "@shared/constants";
import type { TokenContents } from "@shared/types";

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

export class Auth {
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
  #client: APIClient;
  #store: IAppState;
  constructor(_graphql: APIClient, store: IAppState) {
    this.#client = _graphql;
    this.#store = store;
  }

  async check() {
    const cookies = this.#client.cookies.getAll();

    if (cookies[TOKEN_NAME]) {
      try {
        const value = await this.#client.isMe();

        if (value) {
          console.log(value);
          this.#internalState.id = value.me.details.id;
          this.#internalState.username = value.me.details.username;
          this.#callNext();
        }
      } catch (error) {
        this.#internalState.id = "";
        this.#internalState.username = "";

        console.log(error.message);
      }
    }
  }

  #callNext() {
    this.state.next({
      ...this.#internalState,
      authed: !!this.#internalState.username && !!this.#internalState.id
    });
  }

  onLogin(username: string, id: string) {
    this.#internalState.username = username;
    this.#internalState.id = id;

    this.#callNext();
  }

  onLogout() {
    this.#internalState.username = "";
    this.#internalState.id = "";

    this.#callNext();
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
