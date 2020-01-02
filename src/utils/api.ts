import { URLEndpoints } from "./urls";
import { __IS_DEV__, __IS_BROWSER__ } from "./dev";

import "isomorphic-unfetch";
import { Omit } from "./types";

/**
 * @deprecated
 */
interface IOptions {
  token?: string;
  host?: string;
  port?: string;
}

/**
 * @deprecated
 */
export enum Endpoints {
  POST_ENDPOINT = "/api/posts",
  PREVIEW_ENDPOINT = "/api/preview",
  USER_ENDPOINT = "/api/users",
  PASSWORD_ENDPOINT = "/api/password",
  SETTINGS_ENDPOINT = "/api/users/settings",
  AUTH_ENDPOINT = "/api/users/authenticate"
}

type HeaderMethod = "GET" | "PUT" | "POST" | "DELETE";

export const DEFAULT_URL = "http://localhost:3000";

/**
 * @deprecated
 * Creates header for Fetch request with Token
 * @param method
 * @param token
 */
export const createHeader = (
  method: HeaderMethod = "GET",
  token?: string
): RequestInit => {
  return {
    method,
    headers: {
      // "Content-Type": "application/json",
      Authorization: token
    },
    mode: "cors",
    cache: "default"
  };
};

interface ICreateUserBody {
  username: string;
  email: string;
  password: string;
}

export type SettingsBody = Omit<ICreateUserBody, "password">;

/**
 * @deprecated
 */
export async function updateSettings(body: SettingsBody, options: IOptions) {
  const url = URLEndpoints.create(Endpoints.SETTINGS_ENDPOINT, options.host);
  const settings = await fetch(url, {
    ...createHeader("POST", options.token),
    body: JSON.stringify(body)
  }).then(res => res.json());

  return settings;
}

/**
 * @deprecated
 */
export async function updatePassword<T>(body: T, options: IOptions): Promise<any> {
  const url = URLEndpoints.create(Endpoints.PASSWORD_ENDPOINT, options.host);

  const password = await fetch(url, {
    ...createHeader("POST", options.token),
    body: JSON.stringify(body)
  }).then(res => res.json());

  return password;
}
