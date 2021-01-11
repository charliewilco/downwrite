import {
  GraphQLResolveInfo,
  GraphQLScalarType,
  GraphQLScalarTypeConfig
} from "graphql";
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> &
  { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = {
  [X in Exclude<keyof T, K>]?: T[X];
} &
  { [P in K]-?: NonNullable<T[P]> };
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

export type IMe = {
  __typename?: "Me";
  details: Maybe<IUser>;
  token: Maybe<Scalars["String"]>;
  entryCount: Scalars["Int"];
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
  me: Maybe<IMe>;
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

export type IIsMeQueryVariables = Exact<{ [key: string]: never }>;

export type IIsMeQuery = { __typename?: "Query" } & {
  me: Maybe<{ __typename?: "Me" } & Pick<IMe, "token" | "entryCount">>;
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type LegacyStitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type NewStitchingResolver<TResult, TParent, TContext, TArgs> = {
  selectionSet: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type StitchingResolver<TResult, TParent, TContext, TArgs> =
  | LegacyStitchingResolver<TResult, TParent, TContext, TArgs>
  | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs
> {
  subscribe: SubscriptionSubscribeFn<
    { [key in TKey]: TResult },
    TParent,
    TContext,
    TArgs
  >;
  resolve?: SubscriptionResolveFn<
    TResult,
    { [key in TKey]: TResult },
    TContext,
    TArgs
  >;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs
> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<
  TResult,
  TKey extends string,
  TParent = {},
  TContext = {},
  TArgs = {}
> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (
  obj: T,
  context: TContext,
  info: GraphQLResolveInfo
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<
  TResult = {},
  TParent = {},
  TContext = {},
  TArgs = {}
> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type IResolversTypes = ResolversObject<{
  Date: ResolverTypeWrapper<Scalars["Date"]>;
  Entry: ResolverTypeWrapper<IEntry>;
  ID: ResolverTypeWrapper<Scalars["ID"]>;
  String: ResolverTypeWrapper<Scalars["String"]>;
  Boolean: ResolverTypeWrapper<Scalars["Boolean"]>;
  Author: ResolverTypeWrapper<IAuthor>;
  Preview: ResolverTypeWrapper<IPreview>;
  User: ResolverTypeWrapper<IUser>;
  UserSettingsInput: IUserSettingsInput;
  AuthUserPayload: ResolverTypeWrapper<IAuthUserPayload>;
  Me: ResolverTypeWrapper<IMe>;
  Int: ResolverTypeWrapper<Scalars["Int"]>;
  Query: ResolverTypeWrapper<{}>;
  Mutation: ResolverTypeWrapper<{}>;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type IResolversParentTypes = ResolversObject<{
  Date: Scalars["Date"];
  Entry: IEntry;
  ID: Scalars["ID"];
  String: Scalars["String"];
  Boolean: Scalars["Boolean"];
  Author: IAuthor;
  Preview: IPreview;
  User: IUser;
  UserSettingsInput: IUserSettingsInput;
  AuthUserPayload: IAuthUserPayload;
  Me: IMe;
  Int: Scalars["Int"];
  Query: {};
  Mutation: {};
}>;

export interface IDateScalarConfig
  extends GraphQLScalarTypeConfig<IResolversTypes["Date"], any> {
  name: "Date";
}

export type IEntryResolvers<
  ContextType = any,
  ParentType extends IResolversParentTypes["Entry"] = IResolversParentTypes["Entry"]
> = ResolversObject<{
  id: Resolver<Maybe<IResolversTypes["ID"]>, ParentType, ContextType>;
  title: Resolver<Maybe<IResolversTypes["String"]>, ParentType, ContextType>;
  author: Resolver<Maybe<IResolversTypes["Author"]>, ParentType, ContextType>;
  content: Resolver<Maybe<IResolversTypes["String"]>, ParentType, ContextType>;
  public: Resolver<Maybe<IResolversTypes["Boolean"]>, ParentType, ContextType>;
  dateAdded: Resolver<Maybe<IResolversTypes["Date"]>, ParentType, ContextType>;
  dateModified: Resolver<Maybe<IResolversTypes["Date"]>, ParentType, ContextType>;
  excerpt: Resolver<Maybe<IResolversTypes["String"]>, ParentType, ContextType>;
  user: Resolver<Maybe<IResolversTypes["String"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type IAuthorResolvers<
  ContextType = any,
  ParentType extends IResolversParentTypes["Author"] = IResolversParentTypes["Author"]
> = ResolversObject<{
  username: Resolver<Maybe<IResolversTypes["String"]>, ParentType, ContextType>;
  gradient: Resolver<
    Maybe<Array<Maybe<IResolversTypes["String"]>>>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type IPreviewResolvers<
  ContextType = any,
  ParentType extends IResolversParentTypes["Preview"] = IResolversParentTypes["Preview"]
> = ResolversObject<{
  title: Resolver<Maybe<IResolversTypes["String"]>, ParentType, ContextType>;
  id: Resolver<Maybe<IResolversTypes["ID"]>, ParentType, ContextType>;
  content: Resolver<Maybe<IResolversTypes["String"]>, ParentType, ContextType>;
  author: Resolver<Maybe<IResolversTypes["Author"]>, ParentType, ContextType>;
  dateAdded: Resolver<Maybe<IResolversTypes["Date"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type IUserResolvers<
  ContextType = any,
  ParentType extends IResolversParentTypes["User"] = IResolversParentTypes["User"]
> = ResolversObject<{
  username: Resolver<IResolversTypes["String"], ParentType, ContextType>;
  email: Resolver<IResolversTypes["String"], ParentType, ContextType>;
  admin: Resolver<Maybe<IResolversTypes["Boolean"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type IAuthUserPayloadResolvers<
  ContextType = any,
  ParentType extends IResolversParentTypes["AuthUserPayload"] = IResolversParentTypes["AuthUserPayload"]
> = ResolversObject<{
  token: Resolver<Maybe<IResolversTypes["String"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type IMeResolvers<
  ContextType = any,
  ParentType extends IResolversParentTypes["Me"] = IResolversParentTypes["Me"]
> = ResolversObject<{
  details: Resolver<Maybe<IResolversTypes["User"]>, ParentType, ContextType>;
  token: Resolver<Maybe<IResolversTypes["String"]>, ParentType, ContextType>;
  entryCount: Resolver<IResolversTypes["Int"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type IQueryResolvers<
  ContextType = any,
  ParentType extends IResolversParentTypes["Query"] = IResolversParentTypes["Query"]
> = ResolversObject<{
  entry: Resolver<
    Maybe<IResolversTypes["Entry"]>,
    ParentType,
    ContextType,
    RequireFields<IQueryEntryArgs, "id">
  >;
  feed: Resolver<Array<IResolversTypes["Entry"]>, ParentType, ContextType>;
  preview: Resolver<
    Maybe<IResolversTypes["Preview"]>,
    ParentType,
    ContextType,
    RequireFields<IQueryPreviewArgs, "id">
  >;
  settings: Resolver<Maybe<IResolversTypes["User"]>, ParentType, ContextType>;
  me: Resolver<Maybe<IResolversTypes["Me"]>, ParentType, ContextType>;
}>;

export type IMutationResolvers<
  ContextType = any,
  ParentType extends IResolversParentTypes["Mutation"] = IResolversParentTypes["Mutation"]
> = ResolversObject<{
  createEntry: Resolver<
    Maybe<IResolversTypes["Entry"]>,
    ParentType,
    ContextType,
    RequireFields<IMutationCreateEntryArgs, never>
  >;
  updateEntry: Resolver<
    Maybe<IResolversTypes["Entry"]>,
    ParentType,
    ContextType,
    RequireFields<IMutationUpdateEntryArgs, "id" | "content" | "title" | "status">
  >;
  deleteEntry: Resolver<
    Maybe<IResolversTypes["Entry"]>,
    ParentType,
    ContextType,
    RequireFields<IMutationDeleteEntryArgs, "id">
  >;
  createUser: Resolver<
    Maybe<IResolversTypes["AuthUserPayload"]>,
    ParentType,
    ContextType,
    RequireFields<IMutationCreateUserArgs, "username" | "email" | "password">
  >;
  authenticateUser: Resolver<
    Maybe<IResolversTypes["AuthUserPayload"]>,
    ParentType,
    ContextType,
    RequireFields<IMutationAuthenticateUserArgs, "username" | "password">
  >;
  updateUserSettings: Resolver<
    Maybe<IResolversTypes["User"]>,
    ParentType,
    ContextType,
    RequireFields<IMutationUpdateUserSettingsArgs, "settings">
  >;
}>;

export type IResolvers<ContextType = any> = ResolversObject<{
  Date: GraphQLScalarType;
  Entry: IEntryResolvers<ContextType>;
  Author: IAuthorResolvers<ContextType>;
  Preview: IPreviewResolvers<ContextType>;
  User: IUserResolvers<ContextType>;
  AuthUserPayload: IAuthUserPayloadResolvers<ContextType>;
  Me: IMeResolvers<ContextType>;
  Query: IQueryResolvers<ContextType>;
  Mutation: IMutationResolvers<ContextType>;
}>;
