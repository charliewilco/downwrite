import {
  USER_ENDPOINT,
  POST_ENDPOINT,
  SETTINGS_ENDPOINT,
  PASSWORD_ENDPOINT
} from "./urls";
import * as ResponseHandler from "./responseHandler";
import * as Dwnxt from "../types/downwrite";

interface IOptions {
  token: string;
}

export async function getUserDetails(options: IOptions): Promise<any> {
  const user = await fetch(
    USER_ENDPOINT,
    ResponseHandler.createHeader("GET", options.token)
  ).then(res => res.json());

  return user;
}

export async function updateSettings(body, options) {
  const settings = await fetch(SETTINGS_ENDPOINT, {
    ...ResponseHandler.createHeader("POST", options.token),
    body: JSON.stringify(body)
  }).then(res => res.json());

  return settings;
}

export async function updatePassword(body: any, options: IOptions): Promise<any> {
  const password = await fetch(PASSWORD_ENDPOINT, {
    ...ResponseHandler.createHeader("POST", options.token),
    body: JSON.stringify(body)
  }).then(res => res.json());

  return password;
}

export async function getPost(
  id: string,
  options: IOptions
): Promise<Dwnxt.IPost | Dwnxt.IPostError> {
  const post = await fetch(
    `${POST_ENDPOINT}/${id}`,
    ResponseHandler.createHeader("GET", options.token)
  ).then(r => r.json());

  return post;
}

export async function removePost(id, options: IOptions): Promise<Response> {
  const response = await fetch(
    `${POST_ENDPOINT}/${id}`,
    ResponseHandler.createHeader("DELETE", options.token)
  );
  return response;
}

export async function getPosts(
  options: IOptions
): Promise<Dwnxt.IPost[] | Dwnxt.IPostError> {
  const entries: Dwnxt.IPost[] = await fetch(
    POST_ENDPOINT,
    ResponseHandler.createHeader("GET", options.token)
  ).then(res => res.json());

  return entries;
}

export async function createPost(
  body: Dwnxt.IPost,
  options: IOptions
): Promise<Dwnxt.IPost | Dwnxt.IPostError> {
  const post = await fetch(POST_ENDPOINT, {
    ...ResponseHandler.createHeader("POST", options.token),
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
    ...ResponseHandler.createHeader("PUT", options.token),
    body: JSON.stringify(body)
  }).then(res => res.json());

  return entry;
}
