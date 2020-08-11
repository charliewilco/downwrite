import * as Dwnxt from "downwrite";
import { __IS_DEV__, __IS_BROWSER__ } from "./dev";

import "abortcontroller-polyfill/dist/abortcontroller-polyfill-only";

interface IOptions {
  token?: string;
}

interface IUserResponse {
  userID: string;
  id_token: string;
  username: string;
  message?: string;
}

export enum Endpoints {
  POST_ENDPOINT = "/api/posts",
  PREVIEW_ENDPOINT = "/api/posts/preview",
  USER_ENDPOINT = "/api/users",
  PASSWORD_ENDPOINT = "/api/password",
  SETTINGS_ENDPOINT = "/api/users/settings",
  AUTH_ENDPOINT = "/api/users/authenticate"
}

type APIResponse = Dwnxt.IPost | Dwnxt.IPostError;

type HeaderMethod = "GET" | "PUT" | "POST" | "DELETE";

const controller: AbortController = new AbortController();
const signal: AbortSignal = controller.signal;

export function abortFetching() {
  controller.abort();
}

/**
 * Creates header for Fetch request with Token
 * @param method
 * @param token
 */
export const createHeader = (
  method: HeaderMethod = "GET",
  token?: string
): RequestInit => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };

  if (token) {
    headers.Authorization = token;
  }

  return {
    method,
    headers,
    mode: "cors",
    cache: "default",
    signal
  };
};

export interface IAuthUserBody {
  user: string;
  password: string;
}

export async function authUser(body: IAuthUserBody): Promise<any> {
  const auth = await fetch(Endpoints.AUTH_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  }).then(res => res.json());

  return auth;
}

export async function getUserDetails(options: IOptions): Promise<any> {
  const user = await fetch(
    Endpoints.USER_ENDPOINT,
    createHeader("GET", options.token)
  ).then(res => res.json());

  return user;
}

export interface ICreateUserBody {
  username: string;
  email: string;
  password: string;
}

export type SettingsBody = Omit<ICreateUserBody, "password">;

export async function updateSettings(body: SettingsBody, options: IOptions) {
  const settings = await fetch(Endpoints.SETTINGS_ENDPOINT, {
    ...createHeader("POST", options.token),
    body: JSON.stringify(body)
  }).then(res => res.json());

  return settings;
}

export async function createUser(body: ICreateUserBody): Promise<IUserResponse> {
  const user = await fetch(Endpoints.USER_ENDPOINT, {
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
  const password = await fetch(Endpoints.PASSWORD_ENDPOINT, {
    ...createHeader("POST", options.token),
    body: JSON.stringify(body)
  }).then(res => res.json());

  return password;
}

export async function findPreviewEntry(id: string): Promise<null> {
  const entry = await fetch(`${Endpoints.PREVIEW_ENDPOINT}/${id}`, {
    method: "GET",
    mode: "cors"
  }).then(res => res.json());

  return entry;
}

export async function getPost(id: string, options: IOptions): Promise<APIResponse> {
  const post = await fetch(
    `${Endpoints.POST_ENDPOINT}/${id}`,
    createHeader("GET", options.token)
  ).then(res => res.json());

  return post;
}

export async function removePost(id: string, options: IOptions): Promise<Response> {
  const response = await fetch(
    `${Endpoints.POST_ENDPOINT}/${id}`,
    createHeader("DELETE", options.token)
  );
  return response;
}

export async function getPosts(
  options: IOptions
): Promise<Dwnxt.IPost[] | Dwnxt.IPostError> {
  const entries: Dwnxt.IPost[] = await fetch(
    Endpoints.POST_ENDPOINT,
    createHeader("GET", options.token)
  ).then(res => res.json());

  return entries;
}

export async function createPost(
  body: Dwnxt.IPostCreation,
  options: IOptions
): Promise<APIResponse> {
  const post = await fetch(Endpoints.POST_ENDPOINT, {
    ...createHeader("POST", options.token),
    body: JSON.stringify(body)
  }).then(res => res.json());

  return post;
}

export async function updatePost(
  id: string,
  body: Dwnxt.IPost,
  options: IOptions
): Promise<Dwnxt.IPost | Dwnxt.IPostError> {
  const entry = await fetch(`${Endpoints.POST_ENDPOINT}/${id}`, {
    ...createHeader("PUT", options.token),
    body: JSON.stringify(body)
  }).then(res => res.json());

  return entry;
}
