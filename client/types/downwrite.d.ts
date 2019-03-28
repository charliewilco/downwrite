// import * as Draft from "draft-js";

declare module "downwrite" {
  export interface IPost {
    title: string;
    id: string;
    dateAdded: Date;
    dateModified?: Date;
    public: boolean;
    content: Draft.RawDraftContentState;
  }

  export interface IPostCreation {
    title: string;
    id: string;
    dateAdded: Date;
    dateModified?: Date;
    public: boolean;
    content: string;
  }

  export interface IPostError {
    error: string;
    message: string;
    statusCode: number;
  }

  export interface AuthorType {
    username: string;
    gradient: string[];
  }

  export enum Endpoints {
    POST_ENDPOINT = "/api/posts",
    PREVIEW_ENDPOINT = "/api/posts/preview",
    USER_ENDPOINT = "/api/users",
    PASSWORD_ENDPOINT = "/api/password",
    SETTINGS_ENDPOINT = "/api/users/settings",
    AUTH_ENDPOINT = "/api/users/authenticate"
  }
}
