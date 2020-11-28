import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: any;
};

export type IEntry = {
  __typename?: "Entry";
  id: Maybe<Scalars["ID"]>;
  title: Maybe<Scalars["String"]>;
  author: Maybe<IAuthor>;
  content: Maybe<Scalars["String"]>;
  public: Maybe<Scalars["Boolean"]>;
  dateAdded: Maybe<Scalars["Date"]>;
  dateModified: Maybe<Scalars["Date"]>;
  excerpt: Maybe<Scalars["String"]>;
  user: Maybe<Scalars["String"]>;
};

export type IAuthor = {
  __typename?: "Author";
  username: Maybe<Scalars["String"]>;
  gradient: Maybe<Array<Maybe<Scalars["String"]>>>;
};

export type IPreview = {
  __typename?: "Preview";
  title: Maybe<Scalars["String"]>;
  id: Maybe<Scalars["ID"]>;
  content: Maybe<Scalars["String"]>;
  author: Maybe<IAuthor>;
  dateAdded: Maybe<Scalars["Date"]>;
};

export type IUser = {
  __typename?: "User";
  username: Scalars["String"];
  email: Scalars["String"];
  admin: Maybe<Scalars["Boolean"]>;
};

export type IUserSettingsInput = {
  username: Maybe<Scalars["String"]>;
  email: Maybe<Scalars["String"]>;
};

export type IAuthUserPayload = {
  __typename?: "AuthUserPayload";
  token: Maybe<Scalars["String"]>;
};

export type IQuery = {
  __typename?: "Query";
  /** Markdown document */
  entry: Maybe<IEntry>;
  /** List of Markdown documents */
  feed: Array<IEntry>;
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

export type IMutation = {
  __typename?: "Mutation";
  createEntry: Maybe<IEntry>;
  updateEntry: Maybe<IEntry>;
  deleteEntry: Maybe<IEntry>;
  createUser: Maybe<IAuthUserPayload>;
  authenticateUser: Maybe<IAuthUserPayload>;
  updateUserSettings: Maybe<IUser>;
};

export type IMutationCreateEntryArgs = {
  content: Maybe<Scalars["String"]>;
  title: Maybe<Scalars["String"]>;
};

export type IMutationUpdateEntryArgs = {
  id: Scalars["String"];
  content: Scalars["String"];
  title: Scalars["String"];
  status: Scalars["Boolean"];
};

export type IMutationDeleteEntryArgs = {
  id: Scalars["ID"];
};

export type IMutationCreateUserArgs = {
  username: Scalars["String"];
  email: Scalars["String"];
  password: Scalars["String"];
};

export type IMutationAuthenticateUserArgs = {
  username: Scalars["String"];
  password: Scalars["String"];
};

export type IMutationUpdateUserSettingsArgs = {
  settings: IUserSettingsInput;
};

export type IEntryInfoFragment = { __typename?: "Entry" } & Pick<
  IEntry,
  "title" | "dateAdded" | "id" | "public"
>;

export type IAllPostsQueryVariables = Exact<{ [key: string]: never }>;

export type IAllPostsQuery = { __typename?: "Query" } & {
  feed: Array<{ __typename?: "Entry" } & IEntryInfoFragment>;
};

export type IEditQueryVariables = Exact<{
  id: Scalars["ID"];
}>;

export type IEditQuery = { __typename?: "Query" } & {
  entry: Maybe<
    { __typename?: "Entry" } & Pick<IEntry, "content"> & IEntryInfoFragment
  >;
};

export type IPreviewQueryVariables = Exact<{
  id: Scalars["ID"];
}>;

export type IPreviewQuery = { __typename?: "Query" } & {
  preview: Maybe<
    { __typename?: "Preview" } & Pick<
      IPreview,
      "title" | "dateAdded" | "id" | "content"
    > & { author: Maybe<{ __typename?: "Author" } & Pick<IAuthor, "username">> }
  >;
};

export type IUserDetailsQueryVariables = Exact<{ [key: string]: never }>;

export type IUserDetailsQuery = { __typename?: "Query" } & {
  settings: Maybe<{ __typename?: "User" } & Pick<IUser, "username" | "email">>;
};

export type IUpdateEntryMutationVariables = Exact<{
  id: Scalars["String"];
  content: Scalars["String"];
  title: Scalars["String"];
  status: Scalars["Boolean"];
}>;

export type IUpdateEntryMutation = { __typename?: "Mutation" } & {
  updateEntry: Maybe<
    { __typename?: "Entry" } & Pick<IEntry, "content"> & IEntryInfoFragment
  >;
};

export type ICreateEntryMutationVariables = Exact<{
  content: Maybe<Scalars["String"]>;
  title: Maybe<Scalars["String"]>;
}>;

export type ICreateEntryMutation = { __typename?: "Mutation" } & {
  createEntry: Maybe<{ __typename?: "Entry" } & IEntryInfoFragment>;
};

export type IRemoveEntryMutationVariables = Exact<{
  id: Scalars["ID"];
}>;

export type IRemoveEntryMutation = { __typename?: "Mutation" } & {
  deleteEntry: Maybe<{ __typename?: "Entry" } & Pick<IEntry, "title" | "id">>;
};

export type ILoginUserMutationVariables = Exact<{
  username: Scalars["String"];
  password: Scalars["String"];
}>;

export type ILoginUserMutation = { __typename?: "Mutation" } & {
  authenticateUser: Maybe<
    { __typename?: "AuthUserPayload" } & Pick<IAuthUserPayload, "token">
  >;
};

export type ICreateUserMutationVariables = Exact<{
  username: Scalars["String"];
  email: Scalars["String"];
  password: Scalars["String"];
}>;

export type ICreateUserMutation = { __typename?: "Mutation" } & {
  createUser: Maybe<
    { __typename?: "AuthUserPayload" } & Pick<IAuthUserPayload, "token">
  >;
};

export type IUpdateUserSettingsMutationVariables = Exact<{
  settings: IUserSettingsInput;
}>;

export type IUpdateUserSettingsMutation = { __typename?: "Mutation" } & {
  updateUserSettings: Maybe<
    { __typename?: "User" } & Pick<IUser, "username" | "email">
  >;
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

/**
 * __useAllPostsQuery__
 *
 * To run a query within a React component, call `useAllPostsQuery` and pass it any options that fit your needs.
 * When your component renders, `useAllPostsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAllPostsQuery({
 *   variables: {
 *   },
 * });
 */
export function useAllPostsQuery(
  baseOptions?: Apollo.QueryHookOptions<IAllPostsQuery, IAllPostsQueryVariables>
) {
  return Apollo.useQuery<IAllPostsQuery, IAllPostsQueryVariables>(
    AllPostsDocument,
    baseOptions
  );
}
export function useAllPostsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<IAllPostsQuery, IAllPostsQueryVariables>
) {
  return Apollo.useLazyQuery<IAllPostsQuery, IAllPostsQueryVariables>(
    AllPostsDocument,
    baseOptions
  );
}
export type AllPostsQueryHookResult = ReturnType<typeof useAllPostsQuery>;
export type AllPostsLazyQueryHookResult = ReturnType<typeof useAllPostsLazyQuery>;
export type AllPostsQueryResult = Apollo.QueryResult<
  IAllPostsQuery,
  IAllPostsQueryVariables
>;
export const EditDocument = gql`
  query Edit($id: ID!) {
    entry(id: $id) {
      ...EntryInfo
      content
    }
  }
  ${EntryInfoFragmentDoc}
`;

/**
 * __useEditQuery__
 *
 * To run a query within a React component, call `useEditQuery` and pass it any options that fit your needs.
 * When your component renders, `useEditQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEditQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useEditQuery(
  baseOptions: Apollo.QueryHookOptions<IEditQuery, IEditQueryVariables>
) {
  return Apollo.useQuery<IEditQuery, IEditQueryVariables>(EditDocument, baseOptions);
}
export function useEditLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<IEditQuery, IEditQueryVariables>
) {
  return Apollo.useLazyQuery<IEditQuery, IEditQueryVariables>(
    EditDocument,
    baseOptions
  );
}
export type EditQueryHookResult = ReturnType<typeof useEditQuery>;
export type EditLazyQueryHookResult = ReturnType<typeof useEditLazyQuery>;
export type EditQueryResult = Apollo.QueryResult<IEditQuery, IEditQueryVariables>;
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

/**
 * __usePreviewQuery__
 *
 * To run a query within a React component, call `usePreviewQuery` and pass it any options that fit your needs.
 * When your component renders, `usePreviewQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = usePreviewQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function usePreviewQuery(
  baseOptions: Apollo.QueryHookOptions<IPreviewQuery, IPreviewQueryVariables>
) {
  return Apollo.useQuery<IPreviewQuery, IPreviewQueryVariables>(
    PreviewDocument,
    baseOptions
  );
}
export function usePreviewLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<IPreviewQuery, IPreviewQueryVariables>
) {
  return Apollo.useLazyQuery<IPreviewQuery, IPreviewQueryVariables>(
    PreviewDocument,
    baseOptions
  );
}
export type PreviewQueryHookResult = ReturnType<typeof usePreviewQuery>;
export type PreviewLazyQueryHookResult = ReturnType<typeof usePreviewLazyQuery>;
export type PreviewQueryResult = Apollo.QueryResult<
  IPreviewQuery,
  IPreviewQueryVariables
>;
export const UserDetailsDocument = gql`
  query UserDetails {
    settings {
      username
      email
    }
  }
`;

/**
 * __useUserDetailsQuery__
 *
 * To run a query within a React component, call `useUserDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useUserDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUserDetailsQuery({
 *   variables: {
 *   },
 * });
 */
export function useUserDetailsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    IUserDetailsQuery,
    IUserDetailsQueryVariables
  >
) {
  return Apollo.useQuery<IUserDetailsQuery, IUserDetailsQueryVariables>(
    UserDetailsDocument,
    baseOptions
  );
}
export function useUserDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    IUserDetailsQuery,
    IUserDetailsQueryVariables
  >
) {
  return Apollo.useLazyQuery<IUserDetailsQuery, IUserDetailsQueryVariables>(
    UserDetailsDocument,
    baseOptions
  );
}
export type UserDetailsQueryHookResult = ReturnType<typeof useUserDetailsQuery>;
export type UserDetailsLazyQueryHookResult = ReturnType<
  typeof useUserDetailsLazyQuery
>;
export type UserDetailsQueryResult = Apollo.QueryResult<
  IUserDetailsQuery,
  IUserDetailsQueryVariables
>;
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
export type IUpdateEntryMutationFn = Apollo.MutationFunction<
  IUpdateEntryMutation,
  IUpdateEntryMutationVariables
>;

/**
 * __useUpdateEntryMutation__
 *
 * To run a mutation, you first call `useUpdateEntryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateEntryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateEntryMutation, { data, loading, error }] = useUpdateEntryMutation({
 *   variables: {
 *      id: // value for 'id'
 *      content: // value for 'content'
 *      title: // value for 'title'
 *      status: // value for 'status'
 *   },
 * });
 */
export function useUpdateEntryMutation(
  baseOptions?: Apollo.MutationHookOptions<
    IUpdateEntryMutation,
    IUpdateEntryMutationVariables
  >
) {
  return Apollo.useMutation<IUpdateEntryMutation, IUpdateEntryMutationVariables>(
    UpdateEntryDocument,
    baseOptions
  );
}
export type UpdateEntryMutationHookResult = ReturnType<
  typeof useUpdateEntryMutation
>;
export type UpdateEntryMutationResult = Apollo.MutationResult<IUpdateEntryMutation>;
export type UpdateEntryMutationOptions = Apollo.BaseMutationOptions<
  IUpdateEntryMutation,
  IUpdateEntryMutationVariables
>;
export const CreateEntryDocument = gql`
  mutation CreateEntry($content: String, $title: String) {
    createEntry(content: $content, title: $title) {
      ...EntryInfo
    }
  }
  ${EntryInfoFragmentDoc}
`;
export type ICreateEntryMutationFn = Apollo.MutationFunction<
  ICreateEntryMutation,
  ICreateEntryMutationVariables
>;

/**
 * __useCreateEntryMutation__
 *
 * To run a mutation, you first call `useCreateEntryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateEntryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createEntryMutation, { data, loading, error }] = useCreateEntryMutation({
 *   variables: {
 *      content: // value for 'content'
 *      title: // value for 'title'
 *   },
 * });
 */
export function useCreateEntryMutation(
  baseOptions?: Apollo.MutationHookOptions<
    ICreateEntryMutation,
    ICreateEntryMutationVariables
  >
) {
  return Apollo.useMutation<ICreateEntryMutation, ICreateEntryMutationVariables>(
    CreateEntryDocument,
    baseOptions
  );
}
export type CreateEntryMutationHookResult = ReturnType<
  typeof useCreateEntryMutation
>;
export type CreateEntryMutationResult = Apollo.MutationResult<ICreateEntryMutation>;
export type CreateEntryMutationOptions = Apollo.BaseMutationOptions<
  ICreateEntryMutation,
  ICreateEntryMutationVariables
>;
export const RemoveEntryDocument = gql`
  mutation RemoveEntry($id: ID!) {
    deleteEntry(id: $id) {
      title
      id
    }
  }
`;
export type IRemoveEntryMutationFn = Apollo.MutationFunction<
  IRemoveEntryMutation,
  IRemoveEntryMutationVariables
>;

/**
 * __useRemoveEntryMutation__
 *
 * To run a mutation, you first call `useRemoveEntryMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveEntryMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeEntryMutation, { data, loading, error }] = useRemoveEntryMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useRemoveEntryMutation(
  baseOptions?: Apollo.MutationHookOptions<
    IRemoveEntryMutation,
    IRemoveEntryMutationVariables
  >
) {
  return Apollo.useMutation<IRemoveEntryMutation, IRemoveEntryMutationVariables>(
    RemoveEntryDocument,
    baseOptions
  );
}
export type RemoveEntryMutationHookResult = ReturnType<
  typeof useRemoveEntryMutation
>;
export type RemoveEntryMutationResult = Apollo.MutationResult<IRemoveEntryMutation>;
export type RemoveEntryMutationOptions = Apollo.BaseMutationOptions<
  IRemoveEntryMutation,
  IRemoveEntryMutationVariables
>;
export const LoginUserDocument = gql`
  mutation LoginUser($username: String!, $password: String!) {
    authenticateUser(username: $username, password: $password) {
      token
    }
  }
`;
export type ILoginUserMutationFn = Apollo.MutationFunction<
  ILoginUserMutation,
  ILoginUserMutationVariables
>;

/**
 * __useLoginUserMutation__
 *
 * To run a mutation, you first call `useLoginUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginUserMutation, { data, loading, error }] = useLoginUserMutation({
 *   variables: {
 *      username: // value for 'username'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useLoginUserMutation(
  baseOptions?: Apollo.MutationHookOptions<
    ILoginUserMutation,
    ILoginUserMutationVariables
  >
) {
  return Apollo.useMutation<ILoginUserMutation, ILoginUserMutationVariables>(
    LoginUserDocument,
    baseOptions
  );
}
export type LoginUserMutationHookResult = ReturnType<typeof useLoginUserMutation>;
export type LoginUserMutationResult = Apollo.MutationResult<ILoginUserMutation>;
export type LoginUserMutationOptions = Apollo.BaseMutationOptions<
  ILoginUserMutation,
  ILoginUserMutationVariables
>;
export const CreateUserDocument = gql`
  mutation CreateUser($username: String!, $email: String!, $password: String!) {
    createUser(username: $username, email: $email, password: $password) {
      token
    }
  }
`;
export type ICreateUserMutationFn = Apollo.MutationFunction<
  ICreateUserMutation,
  ICreateUserMutationVariables
>;

/**
 * __useCreateUserMutation__
 *
 * To run a mutation, you first call `useCreateUserMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateUserMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createUserMutation, { data, loading, error }] = useCreateUserMutation({
 *   variables: {
 *      username: // value for 'username'
 *      email: // value for 'email'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useCreateUserMutation(
  baseOptions?: Apollo.MutationHookOptions<
    ICreateUserMutation,
    ICreateUserMutationVariables
  >
) {
  return Apollo.useMutation<ICreateUserMutation, ICreateUserMutationVariables>(
    CreateUserDocument,
    baseOptions
  );
}
export type CreateUserMutationHookResult = ReturnType<typeof useCreateUserMutation>;
export type CreateUserMutationResult = Apollo.MutationResult<ICreateUserMutation>;
export type CreateUserMutationOptions = Apollo.BaseMutationOptions<
  ICreateUserMutation,
  ICreateUserMutationVariables
>;
export const UpdateUserSettingsDocument = gql`
  mutation UpdateUserSettings($settings: UserSettingsInput!) {
    updateUserSettings(settings: $settings) {
      username
      email
    }
  }
`;
export type IUpdateUserSettingsMutationFn = Apollo.MutationFunction<
  IUpdateUserSettingsMutation,
  IUpdateUserSettingsMutationVariables
>;

/**
 * __useUpdateUserSettingsMutation__
 *
 * To run a mutation, you first call `useUpdateUserSettingsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserSettingsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserSettingsMutation, { data, loading, error }] = useUpdateUserSettingsMutation({
 *   variables: {
 *      settings: // value for 'settings'
 *   },
 * });
 */
export function useUpdateUserSettingsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    IUpdateUserSettingsMutation,
    IUpdateUserSettingsMutationVariables
  >
) {
  return Apollo.useMutation<
    IUpdateUserSettingsMutation,
    IUpdateUserSettingsMutationVariables
  >(UpdateUserSettingsDocument, baseOptions);
}
export type UpdateUserSettingsMutationHookResult = ReturnType<
  typeof useUpdateUserSettingsMutation
>;
export type UpdateUserSettingsMutationResult = Apollo.MutationResult<IUpdateUserSettingsMutation>;
export type UpdateUserSettingsMutationOptions = Apollo.BaseMutationOptions<
  IUpdateUserSettingsMutation,
  IUpdateUserSettingsMutationVariables
>;
