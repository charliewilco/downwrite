import {
  USER_ENDPOINT,
  POST_ENDPOINT,
  PREVIEW_ENDPOINT,
  SETTINGS_ENDPOINT,
  PASSWORD_ENDPOINT,
  AUTH_ENDPOINT
} from "./urls";

import * as Dwnxt from "../types/downwrite";

interface IOptions {
  token: string;
}

interface IUserResponse {
  userID: string;
  id_token: string;
  username: string;
  message?: string;
}

type APIResponse = Dwnxt.IPost | Dwnxt.IPostError;

type HeaderMethod = "GET" | "PUT" | "POST" | "DELETE";

export const createHeader = (
  method: HeaderMethod = "GET",
  token: string
): RequestInit => {
  const Header = new Headers();

  token && Header.set("Authorization", token);
  Header.set("Content-Type", "application/json");

  return {
    method,
    headers: Header,
    mode: "cors",
    cache: "default"
  };
};

export async function authUser({ user, password }): Promise<any> {
  const auth = await fetch(AUTH_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ user, password })
  }).then(res => res.json());

  return auth;
}

export async function getUserDetails(options: IOptions): Promise<any> {
  const user = await fetch(USER_ENDPOINT, createHeader("GET", options.token)).then(
    res => res.json()
  );

  return user;
}

export async function updateSettings(body, options) {
  const settings = await fetch(SETTINGS_ENDPOINT, {
    ...createHeader("POST", options.token),
    body: JSON.stringify(body)
  }).then(res => res.json());

  return settings;
}

export async function createUser({
  username,
  email,
  password
}): Promise<IUserResponse> {
  const user = await fetch(USER_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, email, password })
  }).then(res => res.json());

  return user;
}

export async function updatePassword(body: any, options: IOptions): Promise<any> {
  const password = await fetch(PASSWORD_ENDPOINT, {
    ...createHeader("POST", options.token),
    body: JSON.stringify(body)
  }).then(res => res.json());

  return password;
}

export async function findPreviewEntry(id: string): Promise<null> {
  const entry = await fetch(`${PREVIEW_ENDPOINT}/${id}`, {
    method: "GET",
    mode: "cors"
  }).then(res => res.json());

  return entry;
}

export async function getPost(id: string, options: IOptions): Promise<APIResponse> {
  const post = await fetch(
    `${POST_ENDPOINT}/${id}`,
    createHeader("GET", options.token)
  ).then(res => res.json());

  return post;
}

export async function removePost(id: string, options: IOptions): Promise<Response> {
  const response = await fetch(
    `${POST_ENDPOINT}/${id}`,
    createHeader("DELETE", options.token)
  );
  return response;
}

export async function getPosts(
  options: IOptions
): Promise<Dwnxt.IPost[] | Dwnxt.IPostError> {
  const entries: Dwnxt.IPost[] = await fetch(
    POST_ENDPOINT,
    createHeader("GET", options.token)
  ).then(res => res.json());

  return entries;
}

export async function createPost(
  body: Dwnxt.IPostCreation,
  options: IOptions
): Promise<APIResponse> {
  const post = await fetch(POST_ENDPOINT, {
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
  const entry = await fetch(`${POST_ENDPOINT}/${id}`, {
    ...createHeader("PUT", options.token),
    body: JSON.stringify(body)
  }).then(res => res.json());

  return entry;
}
