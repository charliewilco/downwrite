import {
  USER_ENDPOINT,
  POST_ENDPOINT,
  PREVIEW_ENDPOINT,
  SETTINGS_ENDPOINT,
  PASSWORD_ENDPOINT,
  AUTH_ENDPOINT,
  createURL
} from "./urls";
import * as Dwnxt from "downwrite";
import { __IS_DEV__, __IS_BROWSER__ } from "./dev";

import "isomorphic-fetch";
import "abortcontroller-polyfill/dist/abortcontroller-polyfill-only";

interface IOptions {
  token?: string;
  host?: string;
}

interface IUserResponse {
  userID: string;
  id_token: string;
  username: string;
  message?: string;
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
  const Header = new Headers();
  if (token) {
    Header.set("Authorization", token);
  }
  Header.set("Content-Type", "application/json");

  return {
    method,
    headers: Header,
    mode: "cors",
    cache: "default",
    signal
  };
};

/**
 * Creates url string for both server and client based off header
 * @param url
 * @param hostname
 * @returns string
 */

export interface IAuthUserBody {
  user: string;
  password: string;
}

export async function authUser(
  { user, password }: IAuthUserBody,
  options?: IOptions
): Promise<any> {
  const url = createURL(AUTH_ENDPOINT, options.host);
  const auth = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ user, password })
  }).then(res => res.json());

  return auth;
}

export async function getUserDetails(options: IOptions): Promise<any> {
  const url = createURL(USER_ENDPOINT, options.host);
  const user = await fetch(url, createHeader("GET", options.token)).then(res =>
    res.json()
  );

  return user;
}

export async function updateSettings(
  body: {
    username: string;
    email: string;
  },
  options: IOptions
) {
  const url = createURL(SETTINGS_ENDPOINT, options.host);
  const settings = await fetch(url, {
    ...createHeader("POST", options.token),
    body: JSON.stringify(body)
  }).then(res => res.json());

  return settings;
}

export interface ICreateUserBody {
  username: string;
  email: string;
  password: string;
}

export async function createUser(
  { username, email, password }: ICreateUserBody,
  options?: IOptions
): Promise<IUserResponse> {
  const url = createURL(USER_ENDPOINT, options.host);

  const user = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, email, password })
  }).then(res => res.json());

  return user;
}

export async function updatePassword(body: any, options: IOptions): Promise<any> {
  const url = createURL(PASSWORD_ENDPOINT, options.host);
  const password = await fetch(url, {
    ...createHeader("POST", options.token),
    body: JSON.stringify(body)
  }).then(res => res.json());

  return password;
}

export async function findPreviewEntry(
  id: string,
  options?: IOptions
): Promise<null> {
  const url = createURL(PREVIEW_ENDPOINT, options.host);
  const entry = await fetch(`${url}/${id}`, {
    method: "GET",
    mode: "cors"
  }).then(res => res.json());

  return entry;
}

export async function getPost(id: string, options: IOptions): Promise<APIResponse> {
  const url = createURL(POST_ENDPOINT, options.host);
  const post = await fetch(`${url}/${id}`, createHeader("GET", options.token)).then(
    res => res.json()
  );

  return post;
}

export async function removePost(id: string, options: IOptions): Promise<Response> {
  const url = createURL(POST_ENDPOINT, options.host);
  const response = await fetch(
    `${url}/${id}`,
    createHeader("DELETE", options.token)
  );
  return response;
}

export async function getPosts(
  options: IOptions
): Promise<Dwnxt.IPost[] | Dwnxt.IPostError> {
  const url = createURL(POST_ENDPOINT, options.host);

  const entries: Dwnxt.IPost[] = await fetch(
    url,
    createHeader("GET", options.token)
  ).then(res => res.json());

  return entries;
}

export async function createPost(
  body: Dwnxt.IPostCreation,
  options: IOptions
): Promise<APIResponse> {
  const url = createURL(POST_ENDPOINT, options.host);
  const post = await fetch(url, {
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
  const url = createURL(POST_ENDPOINT, options.host);
  const entry = await fetch(`${url}/${id}`, {
    ...createHeader("PUT", options.token),
    body: JSON.stringify(body)
  }).then(res => res.json());

  return entry;
}
