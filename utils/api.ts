import { URLEndpoints } from "./urls";
import * as Dwnxt from "downwrite";
import { __IS_DEV__, __IS_BROWSER__ } from "./dev";

import "isomorphic-unfetch";
import { Omit } from "./types";

interface IOptions {
  token?: string;
  host?: string;
  port?: string;
}

interface IUserResponse {
  userID: string;
  id_token: string;
  username: string;
  message?: string;
}

export enum Endpoints {
  POST_ENDPOINT = "/api/posts",
  PREVIEW_ENDPOINT = "/api/preview",
  USER_ENDPOINT = "/api/users",
  PASSWORD_ENDPOINT = "/api/password",
  SETTINGS_ENDPOINT = "/api/users/settings",
  AUTH_ENDPOINT = "/api/users/authenticate"
}

type HeaderMethod = "GET" | "PUT" | "POST" | "DELETE";

const DEFAULT_URL = "http://localhost:3000";

/**
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

export interface IAuthUserBody {
  user: string;
  password: string;
}

export async function authUser(
  body: IAuthUserBody,
  options?: IOptions
): Promise<any> {
  const url = URLEndpoints.create(Endpoints.AUTH_ENDPOINT, options.host);
  const auth = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  }).then(res => res.json());

  return auth;
}

export async function getUserDetails(options: IOptions): Promise<any> {
  const url = URLEndpoints.create(Endpoints.USER_ENDPOINT, options.host);
  const user = await fetch(url, createHeader("GET", options.token)).then(res =>
    res.json()
  );

  return user;
}

export interface ICreateUserBody {
  username: string;
  email: string;
  password: string;
}

export type SettingsBody = Omit<ICreateUserBody, "password">;

export async function updateSettings(body: SettingsBody, options: IOptions) {
  const url = URLEndpoints.create(Endpoints.SETTINGS_ENDPOINT, options.host);
  const settings = await fetch(url, {
    ...createHeader("POST", options.token),
    body: JSON.stringify(body)
  }).then(res => res.json());

  return settings;
}

export async function createUser(
  body: ICreateUserBody,
  options?: IOptions
): Promise<IUserResponse> {
  const url = URLEndpoints.create(Endpoints.USER_ENDPOINT, options.host);

  const user = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  }).then(res => res.json());

  return user;
}

// TODO: Remove Any
export async function updatePassword(body: any, options: IOptions): Promise<any> {
  const url = URLEndpoints.create(Endpoints.PASSWORD_ENDPOINT, options.host);

  const password = await fetch(url, {
    ...createHeader("POST", options.token),
    body: JSON.stringify(body)
  }).then(res => res.json());

  return password;
}

export async function removePost(id: string, options: IOptions): Promise<Response> {
  const url = URLEndpoints.create(Endpoints.POST_ENDPOINT, options.host);
  const response = await fetch(
    `${url}/${id}`,
    createHeader("DELETE", options.token)
  );
  return response;
}

export async function getPosts({
  token
}: IOptions): Promise<Dwnxt.IPost[] | Dwnxt.IPostError> {
  const url = DEFAULT_URL.concat(Endpoints.POST_ENDPOINT);
  const entries: Dwnxt.IPost[] = await fetch(url, createHeader("GET", token)).then(
    res => res.json()
  );

  return entries;
}
