import * as Draft from 'draft-js';

export interface IPost {
  title: string;
  id: string;
  dateAdded: Date;
  dateModified: Date;
  public: boolean;
  content: Draft.RawDraftContentState;
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

// declare namespace

// interface Entry {
//   content: Draft.RawDraftContentState;
//   title: string;
//   public: boolean;
//   dateAdded: Date;
// }

// export IPost
// export IPostError
