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
    dateAdded?: Date;
    dateModified?: Date;
    public?: boolean;
    content: Draft.RawDraftContentState;
  }

  export interface IPostError {
    error: string;
    message: string;
    statusCode: number;
  }

  export interface IAuthorType {
    username: string;
    gradient: string[];
  }

  export interface IPreviewEntry {
    title: string;
    content: string;
    author: IAuthorType;
    dateAdded: Date;
  }

  export interface IPreviewEntryError {
    message: string;
    error: string;
  }

  /** Represents a List of Entries */
  export type EntryList = IPost[];
}
