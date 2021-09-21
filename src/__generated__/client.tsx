import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
const defaultOptions = {};
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
  content: Maybe<Scalars["String"]>;
  title: Maybe<Scalars["String"]>;
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
  username: Scalars["String"];
};

export type IUserSettingsInput = {
  email: Maybe<Scalars["String"]>;
  username: Maybe<Scalars["String"]>;
};

export type IEntryInfoFragment = {
  __typename?: "Entry";
  title: Maybe<string>;
  dateAdded: Maybe<any>;
  id: Maybe<string>;
  public: Maybe<boolean>;
};

export type IAllPostsQueryVariables = Exact<{ [key: string]: never }>;

export type IAllPostsQuery = {
  __typename?: "Query";
  feed: Array<{
    __typename?: "Entry";
    title: Maybe<string>;
    dateAdded: Maybe<any>;
    id: Maybe<string>;
    public: Maybe<boolean>;
  }>;
};

export type IEditQueryVariables = Exact<{
  id: Scalars["ID"];
}>;

export type IEditQuery = {
  __typename?: "Query";
  entry: Maybe<{
    __typename?: "Entry";
    content: Maybe<string>;
    title: Maybe<string>;
    dateAdded: Maybe<any>;
    id: Maybe<string>;
    public: Maybe<boolean>;
  }>;
};

export type IPreviewQueryVariables = Exact<{
  id: Scalars["ID"];
}>;

export type IPreviewQuery = {
  __typename?: "Query";
  preview: Maybe<{
    __typename?: "Preview";
    title: Maybe<string>;
    dateAdded: Maybe<any>;
    id: Maybe<string>;
    content: Maybe<string>;
    author: Maybe<{ __typename?: "Author"; username: Maybe<string> }>;
  }>;
};

export type IUserDetailsQueryVariables = Exact<{ [key: string]: never }>;

export type IUserDetailsQuery = {
  __typename?: "Query";
  settings: Maybe<{ __typename?: "User"; username: string; email: string }>;
  me: Maybe<{
    __typename?: "Me";
    usage: {
      __typename?: "UsageDetails";
      entryCount: number;
      publicEntries: number;
      privateEntries: number;
    };
  }>;
};

export type IUpdateEntryMutationVariables = Exact<{
  id: Scalars["String"];
  content: Scalars["String"];
  title: Scalars["String"];
  status: Scalars["Boolean"];
}>;

export type IUpdateEntryMutation = {
  __typename?: "Mutation";
  updateEntry: Maybe<{
    __typename?: "Entry";
    content: Maybe<string>;
    title: Maybe<string>;
    dateAdded: Maybe<any>;
    id: Maybe<string>;
    public: Maybe<boolean>;
  }>;
};

export type ICreateEntryMutationVariables = Exact<{
  content: Maybe<Scalars["String"]>;
  title: Maybe<Scalars["String"]>;
}>;

export type ICreateEntryMutation = {
  __typename?: "Mutation";
  createEntry: Maybe<{
    __typename?: "Entry";
    title: Maybe<string>;
    dateAdded: Maybe<any>;
    id: Maybe<string>;
    public: Maybe<boolean>;
  }>;
};

export type IRemoveEntryMutationVariables = Exact<{
  id: Scalars["ID"];
}>;

export type IRemoveEntryMutation = {
  __typename?: "Mutation";
  deleteEntry: Maybe<{
    __typename?: "Entry";
    title: Maybe<string>;
    id: Maybe<string>;
  }>;
};

export type ILoginUserMutationVariables = Exact<{
  username: Scalars["String"];
  password: Scalars["String"];
}>;

export type ILoginUserMutation = {
  __typename?: "Mutation";
  authenticateUser: Maybe<{ __typename?: "AuthUserPayload"; token: Maybe<string> }>;
};

export type ICreateUserMutationVariables = Exact<{
  username: Scalars["String"];
  email: Scalars["String"];
  password: Scalars["String"];
}>;

export type ICreateUserMutation = {
  __typename?: "Mutation";
  createUser: Maybe<{ __typename?: "AuthUserPayload"; token: Maybe<string> }>;
};

export type IUpdateUserSettingsMutationVariables = Exact<{
  settings: IUserSettingsInput;
}>;

export type IUpdateUserSettingsMutation = {
  __typename?: "Mutation";
  updateUserSettings: Maybe<{
    __typename?: "User";
    username: string;
    email: string;
  }>;
};

export type IUpdatePasswordMutationVariables = Exact<{
  current: Scalars["String"];
  newPassword: Scalars["String"];
}>;

export type IUpdatePasswordMutation = {
  __typename?: "Mutation";
  updatePassword: Maybe<{ __typename?: "AuthUserPayload"; token: Maybe<string> }>;
};

export type IIsMeQueryVariables = Exact<{ [key: string]: never }>;

export type IIsMeQuery = {
  __typename?: "Query";
  me: Maybe<{ __typename?: "Me"; token: Maybe<string> }>;
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<IAllPostsQuery, IAllPostsQueryVariables>(
    AllPostsDocument,
    options
  );
}
export function useAllPostsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<IAllPostsQuery, IAllPostsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<IAllPostsQuery, IAllPostsQueryVariables>(
    AllPostsDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<IEditQuery, IEditQueryVariables>(EditDocument, options);
}
export function useEditLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<IEditQuery, IEditQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<IEditQuery, IEditQueryVariables>(EditDocument, options);
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<IPreviewQuery, IPreviewQueryVariables>(
    PreviewDocument,
    options
  );
}
export function usePreviewLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<IPreviewQuery, IPreviewQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<IPreviewQuery, IPreviewQueryVariables>(
    PreviewDocument,
    options
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
    me {
      usage {
        entryCount
        publicEntries
        privateEntries
      }
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<IUserDetailsQuery, IUserDetailsQueryVariables>(
    UserDetailsDocument,
    options
  );
}
export function useUserDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    IUserDetailsQuery,
    IUserDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<IUserDetailsQuery, IUserDetailsQueryVariables>(
    UserDetailsDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<IUpdateEntryMutation, IUpdateEntryMutationVariables>(
    UpdateEntryDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<ICreateEntryMutation, ICreateEntryMutationVariables>(
    CreateEntryDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<IRemoveEntryMutation, IRemoveEntryMutationVariables>(
    RemoveEntryDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<ILoginUserMutation, ILoginUserMutationVariables>(
    LoginUserDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<ICreateUserMutation, ICreateUserMutationVariables>(
    CreateUserDocument,
    options
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
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    IUpdateUserSettingsMutation,
    IUpdateUserSettingsMutationVariables
  >(UpdateUserSettingsDocument, options);
}
export type UpdateUserSettingsMutationHookResult = ReturnType<
  typeof useUpdateUserSettingsMutation
>;
export type UpdateUserSettingsMutationResult =
  Apollo.MutationResult<IUpdateUserSettingsMutation>;
export type UpdateUserSettingsMutationOptions = Apollo.BaseMutationOptions<
  IUpdateUserSettingsMutation,
  IUpdateUserSettingsMutationVariables
>;
export const UpdatePasswordDocument = gql`
  mutation UpdatePassword($current: String!, $newPassword: String!) {
    updatePassword(currentPassword: $current, newPassword: $newPassword) {
      token
    }
  }
`;
export type IUpdatePasswordMutationFn = Apollo.MutationFunction<
  IUpdatePasswordMutation,
  IUpdatePasswordMutationVariables
>;

/**
 * __useUpdatePasswordMutation__
 *
 * To run a mutation, you first call `useUpdatePasswordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdatePasswordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updatePasswordMutation, { data, loading, error }] = useUpdatePasswordMutation({
 *   variables: {
 *      current: // value for 'current'
 *      newPassword: // value for 'newPassword'
 *   },
 * });
 */
export function useUpdatePasswordMutation(
  baseOptions?: Apollo.MutationHookOptions<
    IUpdatePasswordMutation,
    IUpdatePasswordMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    IUpdatePasswordMutation,
    IUpdatePasswordMutationVariables
  >(UpdatePasswordDocument, options);
}
export type UpdatePasswordMutationHookResult = ReturnType<
  typeof useUpdatePasswordMutation
>;
export type UpdatePasswordMutationResult =
  Apollo.MutationResult<IUpdatePasswordMutation>;
export type UpdatePasswordMutationOptions = Apollo.BaseMutationOptions<
  IUpdatePasswordMutation,
  IUpdatePasswordMutationVariables
>;
export const IsMeDocument = gql`
  query IsMe {
    me {
      token
    }
  }
`;

/**
 * __useIsMeQuery__
 *
 * To run a query within a React component, call `useIsMeQuery` and pass it any options that fit your needs.
 * When your component renders, `useIsMeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useIsMeQuery({
 *   variables: {
 *   },
 * });
 */
export function useIsMeQuery(
  baseOptions?: Apollo.QueryHookOptions<IIsMeQuery, IIsMeQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<IIsMeQuery, IIsMeQueryVariables>(IsMeDocument, options);
}
export function useIsMeLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<IIsMeQuery, IIsMeQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<IIsMeQuery, IIsMeQueryVariables>(IsMeDocument, options);
}
export type IsMeQueryHookResult = ReturnType<typeof useIsMeQuery>;
export type IsMeLazyQueryHookResult = ReturnType<typeof useIsMeLazyQuery>;
export type IsMeQueryResult = Apollo.QueryResult<IIsMeQuery, IIsMeQueryVariables>;
