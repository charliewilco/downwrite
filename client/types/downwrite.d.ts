// import * as Draft from "draft-js";

declare module "downwrite" {
  /** Represents a Single Entry */
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

  /** Represents a List of Entries */
  export type EntryList = IPost[];

  /** API Endpoints */
  export enum Endpoints {
    POST_ENDPOINT = "/api/posts",
    PREVIEW_ENDPOINT = "/api/posts/preview",
    USER_ENDPOINT = "/api/users",
    PASSWORD_ENDPOINT = "/api/password",
    SETTINGS_ENDPOINT = "/api/users/settings",
    AUTH_ENDPOINT = "/api/users/authenticate"
  }

  /** UI Theme for Downwrite */
  export interface UIDefaultTheme {
    night: boolean;
    background: string;
    color: string;
    border: string;
    link: string;
    linkHover: string;
    meta: string;
    inputBorder: string;
    cardBackground: string;
    cardTrayBackground: string;
    cardDeleteButton: string;
    headerLogoLink: string;
    landingPageTitle: string;
  }
}
