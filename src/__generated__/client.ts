import { GraphQLClient } from "graphql-request";
import * as Dom from "graphql-request/dist/types.dom";
import gql from "graphql-tag";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: any;
};

export type IAuthUserPayload = {
  __typename?: "AuthUserPayload";
  token: Maybe<Scalars["String"]>;
};

export type IAuthor = {
  __typename?: "Author";
  gradient: Maybe<Array<Maybe<Scalars["String"]>>>;
  username: Maybe<Scalars["String"]>;
};

export type IEntry = {
  __typename?: "Entry";
  author: Maybe<IAuthor>;
  content: Maybe<Scalars["String"]>;
  dateAdded: Maybe<Scalars["Date"]>;
  dateModified: Maybe<Scalars["Date"]>;
  excerpt: Maybe<Scalars["String"]>;
  id: Maybe<Scalars["ID"]>;
  public: Maybe<Scalars["Boolean"]>;
  title: Maybe<Scalars["String"]>;
  user: Maybe<Scalars["String"]>;
};

export type IMe = {
  __typename?: "Me";
  details: Maybe<IUser>;
  token: Maybe<Scalars["String"]>;
  usage: IUsageDetails;
};

export type IMutation = {
  __typename?: "Mutation";
  authenticateUser: Maybe<IAuthUserPayload>;
  createEntry: Maybe<IEntry>;
  createUser: Maybe<IAuthUserPayload>;
  deleteEntry: Maybe<IEntry>;
  updateEntry: Maybe<IEntry>;
  updatePassword: Maybe<IAuthUserPayload>;
  updateUserSettings: Maybe<IUser>;
};

export type IMutationAuthenticateUserArgs = {
  password: Scalars["String"];
  username: Scalars["String"];
};

export type IMutationCreateEntryArgs = {
  content: InputMaybe<Scalars["String"]>;
  title: InputMaybe<Scalars["String"]>;
};

export type IMutationCreateUserArgs = {
  email: Scalars["String"];
  password: Scalars["String"];
  username: Scalars["String"];
};

export type IMutationDeleteEntryArgs = {
  id: Scalars["ID"];
};

export type IMutationUpdateEntryArgs = {
  content: Scalars["String"];
  id: Scalars["String"];
  status: Scalars["Boolean"];
  title: Scalars["String"];
};

export type IMutationUpdatePasswordArgs = {
  currentPassword: Scalars["String"];
  newPassword: Scalars["String"];
};

export type IMutationUpdateUserSettingsArgs = {
  settings: IUserSettingsInput;
};

export type IPreview = {
  __typename?: "Preview";
  author: Maybe<IAuthor>;
  content: Maybe<Scalars["String"]>;
  dateAdded: Maybe<Scalars["Date"]>;
  id: Maybe<Scalars["ID"]>;
  title: Maybe<Scalars["String"]>;
};

export type IQuery = {
  __typename?: "Query";
  /** Markdown document */
  entry: Maybe<IEntry>;
  /** List of Markdown documents */
  feed: Array<IEntry>;
  me: Maybe<IMe>;
  /** Public preview of Markdown document */
  preview: Maybe<IPreview>;
  /** User Settings */
  settings: Maybe<IUser>;
};

export type IQueryEntryArgs = {
  id: Scalars["ID"];
};

export type IQueryPreviewArgs = {
  id: Scalars["ID"];
};

export type IUsageDetails = {
  __typename?: "UsageDetails";
  entryCount: Scalars["Int"];
  privateEntries: Scalars["Int"];
  publicEntries: Scalars["Int"];
};

export type IUser = {
  __typename?: "User";
  admin: Maybe<Scalars["Boolean"]>;
  email: Scalars["String"];
  id: Scalars["ID"];
  username: Scalars["String"];
};

export type IUserSettingsInput = {
  email: InputMaybe<Scalars["String"]>;
  username: InputMaybe<Scalars["String"]>;
};

export type IEntryInfoFragment = {
  __typename?: "Entry";
  title: string | null | undefined;
  dateAdded: any | null | undefined;
  id: string | null | undefined;
  public: boolean | null | undefined;
};

export type IAllPostsQueryVariables = Exact<{ [key: string]: never }>;

export type IAllPostsQuery = {
  __typename?: "Query";
  feed: Array<{
    __typename?: "Entry";
    title: string | null | undefined;
    dateAdded: any | null | undefined;
    id: string | null | undefined;
    public: boolean | null | undefined;
  }>;
};

export type IEditQueryVariables = Exact<{
  id: Scalars["ID"];
}>;

export type IEditQuery = {
  __typename?: "Query";
  entry:
    | {
        __typename?: "Entry";
        content: string | null | undefined;
        title: string | null | undefined;
        dateAdded: any | null | undefined;
        id: string | null | undefined;
        public: boolean | null | undefined;
      }
    | null
    | undefined;
};

export type IPreviewQueryVariables = Exact<{
  id: Scalars["ID"];
}>;

export type IPreviewQuery = {
  __typename?: "Query";
  preview:
    | {
        __typename?: "Preview";
        title: string | null | undefined;
        dateAdded: any | null | undefined;
        id: string | null | undefined;
        content: string | null | undefined;
        author:
          | { __typename?: "Author"; username: string | null | undefined }
          | null
          | undefined;
      }
    | null
    | undefined;
};

export type IUserDetailsQueryVariables = Exact<{ [key: string]: never }>;

export type IUserDetailsQuery = {
  __typename?: "Query";
  settings:
    | { __typename?: "User"; username: string; email: string }
    | null
    | undefined;
  me:
    | {
        __typename?: "Me";
        usage: {
          __typename?: "UsageDetails";
          entryCount: number;
          publicEntries: number;
          privateEntries: number;
        };
      }
    | null
    | undefined;
};

export type IUpdateEntryMutationVariables = Exact<{
  id: Scalars["String"];
  content: Scalars["String"];
  title: Scalars["String"];
  status: Scalars["Boolean"];
}>;

export type IUpdateEntryMutation = {
  __typename?: "Mutation";
  updateEntry:
    | {
        __typename?: "Entry";
        content: string | null | undefined;
        title: string | null | undefined;
        dateAdded: any | null | undefined;
        id: string | null | undefined;
        public: boolean | null | undefined;
      }
    | null
    | undefined;
};

export type ICreateEntryMutationVariables = Exact<{
  content: InputMaybe<Scalars["String"]>;
  title: InputMaybe<Scalars["String"]>;
}>;

export type ICreateEntryMutation = {
  __typename?: "Mutation";
  createEntry:
    | {
        __typename?: "Entry";
        title: string | null | undefined;
        dateAdded: any | null | undefined;
        id: string | null | undefined;
        public: boolean | null | undefined;
      }
    | null
    | undefined;
};

export type IRemoveEntryMutationVariables = Exact<{
  id: Scalars["ID"];
}>;

export type IRemoveEntryMutation = {
  __typename?: "Mutation";
  deleteEntry:
    | {
        __typename?: "Entry";
        title: string | null | undefined;
        id: string | null | undefined;
      }
    | null
    | undefined;
};

export type ILoginUserMutationVariables = Exact<{
  username: Scalars["String"];
  password: Scalars["String"];
}>;

export type ILoginUserMutation = {
  __typename?: "Mutation";
  authenticateUser:
    | { __typename?: "AuthUserPayload"; token: string | null | undefined }
    | null
    | undefined;
};

export type ICreateUserMutationVariables = Exact<{
  username: Scalars["String"];
  email: Scalars["String"];
  password: Scalars["String"];
}>;

export type ICreateUserMutation = {
  __typename?: "Mutation";
  createUser:
    | { __typename?: "AuthUserPayload"; token: string | null | undefined }
    | null
    | undefined;
};

export type IUpdateUserSettingsMutationVariables = Exact<{
  settings: IUserSettingsInput;
}>;

export type IUpdateUserSettingsMutation = {
  __typename?: "Mutation";
  updateUserSettings:
    | { __typename?: "User"; username: string; email: string }
    | null
    | undefined;
};

export type IUpdatePasswordMutationVariables = Exact<{
  current: Scalars["String"];
  newPassword: Scalars["String"];
}>;

export type IUpdatePasswordMutation = {
  __typename?: "Mutation";
  updatePassword:
    | { __typename?: "AuthUserPayload"; token: string | null | undefined }
    | null
    | undefined;
};

export type IIsMeQueryVariables = Exact<{ [key: string]: never }>;

export type IIsMeQuery = {
  __typename?: "Query";
  me:
    | {
        __typename?: "Me";
        token: string | null | undefined;
        details:
          | { __typename?: "User"; id: string; username: string }
          | null
          | undefined;
      }
    | null
    | undefined;
};

export const EntryInfoFragmentDoc = gql`
  fragment EntryInfo on Entry {
    title
    dateAdded
    id
    public
  }
`;
export const AllPostsDocument = gql`
  query AllPosts {
    feed {
      ...EntryInfo
    }
  }
  ${EntryInfoFragmentDoc}
`;
export const EditDocument = gql`
  query Edit($id: ID!) {
    entry(id: $id) {
      ...EntryInfo
      content
    }
  }
  ${EntryInfoFragmentDoc}
`;
export const PreviewDocument = gql`
  query Preview($id: ID!) {
    preview(id: $id) {
      title
      dateAdded
      id
      content
      author {
        username
      }
    }
  }
`;
export const UserDetailsDocument = gql`
  query UserDetails {
    settings {
      username
      email
    }
    me {
      usage {
        entryCount
        publicEntries
        privateEntries
      }
    }
  }
`;
export const UpdateEntryDocument = gql`
  mutation UpdateEntry(
    $id: String!
    $content: String!
    $title: String!
    $status: Boolean!
  ) {
    updateEntry(id: $id, content: $content, title: $title, status: $status) {
      ...EntryInfo
      content
    }
  }
  ${EntryInfoFragmentDoc}
`;
export const CreateEntryDocument = gql`
  mutation CreateEntry($content: String, $title: String) {
    createEntry(content: $content, title: $title) {
      ...EntryInfo
    }
  }
  ${EntryInfoFragmentDoc}
`;
export const RemoveEntryDocument = gql`
  mutation RemoveEntry($id: ID!) {
    deleteEntry(id: $id) {
      title
      id
    }
  }
`;
export const LoginUserDocument = gql`
  mutation LoginUser($username: String!, $password: String!) {
    authenticateUser(username: $username, password: $password) {
      token
    }
  }
`;
export const CreateUserDocument = gql`
  mutation CreateUser($username: String!, $email: String!, $password: String!) {
    createUser(username: $username, email: $email, password: $password) {
      token
    }
  }
`;
export const UpdateUserSettingsDocument = gql`
  mutation UpdateUserSettings($settings: UserSettingsInput!) {
    updateUserSettings(settings: $settings) {
      username
      email
    }
  }
`;
export const UpdatePasswordDocument = gql`
  mutation UpdatePassword($current: String!, $newPassword: String!) {
    updatePassword(currentPassword: $current, newPassword: $newPassword) {
      token
    }
  }
`;
export const IsMeDocument = gql`
  query IsMe {
    me {
      token
      details {
        id
        username
      }
    }
  }
`;

export type SdkFunctionWrapper = <T>(
  action: (requestHeaders?: Record<string, string>) => Promise<T>,
  operationName: string
) => Promise<T>;

const defaultWrapper: SdkFunctionWrapper = (action, _operationName) => action();

export function getSdk(
  client: GraphQLClient,
  withWrapper: SdkFunctionWrapper = defaultWrapper
) {
  return {
    AllPosts(
      variables?: IAllPostsQueryVariables,
      requestHeaders?: Dom.RequestInit["headers"]
    ): Promise<IAllPostsQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<IAllPostsQuery>(AllPostsDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders
          }),
        "AllPosts"
      );
    },
    Edit(
      variables: IEditQueryVariables,
      requestHeaders?: Dom.RequestInit["headers"]
    ): Promise<IEditQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<IEditQuery>(EditDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders
          }),
        "Edit"
      );
    },
    Preview(
      variables: IPreviewQueryVariables,
      requestHeaders?: Dom.RequestInit["headers"]
    ): Promise<IPreviewQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<IPreviewQuery>(PreviewDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders
          }),
        "Preview"
      );
    },
    UserDetails(
      variables?: IUserDetailsQueryVariables,
      requestHeaders?: Dom.RequestInit["headers"]
    ): Promise<IUserDetailsQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<IUserDetailsQuery>(UserDetailsDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders
          }),
        "UserDetails"
      );
    },
    UpdateEntry(
      variables: IUpdateEntryMutationVariables,
      requestHeaders?: Dom.RequestInit["headers"]
    ): Promise<IUpdateEntryMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<IUpdateEntryMutation>(UpdateEntryDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders
          }),
        "UpdateEntry"
      );
    },
    CreateEntry(
      variables?: ICreateEntryMutationVariables,
      requestHeaders?: Dom.RequestInit["headers"]
    ): Promise<ICreateEntryMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<ICreateEntryMutation>(CreateEntryDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders
          }),
        "CreateEntry"
      );
    },
    RemoveEntry(
      variables: IRemoveEntryMutationVariables,
      requestHeaders?: Dom.RequestInit["headers"]
    ): Promise<IRemoveEntryMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<IRemoveEntryMutation>(RemoveEntryDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders
          }),
        "RemoveEntry"
      );
    },
    LoginUser(
      variables: ILoginUserMutationVariables,
      requestHeaders?: Dom.RequestInit["headers"]
    ): Promise<ILoginUserMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<ILoginUserMutation>(LoginUserDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders
          }),
        "LoginUser"
      );
    },
    CreateUser(
      variables: ICreateUserMutationVariables,
      requestHeaders?: Dom.RequestInit["headers"]
    ): Promise<ICreateUserMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<ICreateUserMutation>(CreateUserDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders
          }),
        "CreateUser"
      );
    },
    UpdateUserSettings(
      variables: IUpdateUserSettingsMutationVariables,
      requestHeaders?: Dom.RequestInit["headers"]
    ): Promise<IUpdateUserSettingsMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<IUpdateUserSettingsMutation>(
            UpdateUserSettingsDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders }
          ),
        "UpdateUserSettings"
      );
    },
    UpdatePassword(
      variables: IUpdatePasswordMutationVariables,
      requestHeaders?: Dom.RequestInit["headers"]
    ): Promise<IUpdatePasswordMutation> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<IUpdatePasswordMutation>(
            UpdatePasswordDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders }
          ),
        "UpdatePassword"
      );
    },
    IsMe(
      variables?: IIsMeQueryVariables,
      requestHeaders?: Dom.RequestInit["headers"]
    ): Promise<IIsMeQuery> {
      return withWrapper(
        (wrappedRequestHeaders) =>
          client.request<IIsMeQuery>(IsMeDocument, variables, {
            ...requestHeaders,
            ...wrappedRequestHeaders
          }),
        "IsMe"
      );
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;
