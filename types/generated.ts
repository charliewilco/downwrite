export type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: any;
};

export type Author = {
  __typename?: "Author";
  username?: Maybe<Scalars["String"]>;
  gradient?: Maybe<Array<Maybe<Scalars["String"]>>>;
};

export type AuthUserPayload = {
  __typename?: "AuthUserPayload";
  user?: Maybe<User>;
  token?: Maybe<Scalars["String"]>;
};

export type Entry = {
  __typename?: "Entry";
  id?: Maybe<Scalars["ID"]>;
  title?: Maybe<Scalars["String"]>;
  author?: Maybe<Scalars["String"]>;
  content?: Maybe<Scalars["String"]>;
  public?: Maybe<Scalars["Boolean"]>;
  dateAdded?: Maybe<Scalars["Date"]>;
  dateModified?: Maybe<Scalars["Date"]>;
  excerpt?: Maybe<Scalars["String"]>;
  user?: Maybe<Scalars["String"]>;
};

export type Mutation = {
  __typename?: "Mutation";
  createEntry?: Maybe<Entry>;
  updateEntry?: Maybe<Entry>;
  deleteEntry?: Maybe<Entry>;
  createUser?: Maybe<AuthUserPayload>;
  authenticateUser?: Maybe<AuthUserPayload>;
  updateUserSettings?: Maybe<User>;
};

export type MutationCreateEntryArgs = {
  content?: Maybe<Scalars["String"]>;
  title?: Maybe<Scalars["String"]>;
};

export type MutationUpdateEntryArgs = {
  id?: Maybe<Scalars["String"]>;
  content?: Maybe<Scalars["String"]>;
  title?: Maybe<Scalars["String"]>;
  status?: Maybe<Scalars["Boolean"]>;
};

export type MutationDeleteEntryArgs = {
  id?: Maybe<Scalars["ID"]>;
};

export type MutationCreateUserArgs = {
  username: Scalars["String"];
  email: Scalars["String"];
  password: Scalars["String"];
};

export type MutationAuthenticateUserArgs = {
  username: Scalars["String"];
  password: Scalars["String"];
};

export type MutationUpdateUserSettingsArgs = {
  settings: UserSettingsInput;
};

export type Preview = {
  __typename?: "Preview";
  title?: Maybe<Scalars["String"]>;
  id?: Maybe<Scalars["ID"]>;
  content?: Maybe<Scalars["String"]>;
  author?: Maybe<Author>;
  dateAdded?: Maybe<Scalars["Date"]>;
};

export type Query = {
  __typename?: "Query";
  /** Markdown document */
  entry?: Maybe<Entry>;
  /** List of Markdown documents */
  feed: Array<Entry>;
  /** Public preview of Markdown document */
  preview?: Maybe<Preview>;
  /** User Settings */
  settings?: Maybe<User>;
};

export type QueryEntryArgs = {
  id?: Maybe<Scalars["ID"]>;
};

export type QueryPreviewArgs = {
  id?: Maybe<Scalars["ID"]>;
};

export type User = {
  __typename?: "User";
  username: Scalars["String"];
  email: Scalars["String"];
  admin?: Maybe<Scalars["Boolean"]>;
  posts?: Maybe<Array<Maybe<Entry>>>;
};

export type UserSettingsInput = {
  username?: Maybe<Scalars["String"]>;
  email?: Maybe<Scalars["String"]>;
};
