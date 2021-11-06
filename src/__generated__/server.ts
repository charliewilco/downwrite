import {
  GraphQLResolveInfo,
  GraphQLScalarType,
  GraphQLScalarTypeConfig
} from "graphql";
export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type RequireFields<T, K extends keyof T> = {
  [X in Exclude<keyof T, K>]?: T[X];
} & { [P in K]-?: NonNullable<T[P]> };
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
  title: string | null;
  dateAdded: any | null;
  id: string | null;
  public: boolean | null;
};

export type IAllPostsQueryVariables = Exact<{ [key: string]: never }>;

export type IAllPostsQuery = {
  __typename?: "Query";
  feed: Array<{
    __typename?: "Entry";
    title: string | null;
    dateAdded: any | null;
    id: string | null;
    public: boolean | null;
  }>;
};

export type IEditQueryVariables = Exact<{
  id: Scalars["ID"];
}>;

export type IEditQuery = {
  __typename?: "Query";
  entry: {
    __typename?: "Entry";
    content: string | null;
    title: string | null;
    dateAdded: any | null;
    id: string | null;
    public: boolean | null;
  } | null;
};

export type IPreviewQueryVariables = Exact<{
  id: Scalars["ID"];
}>;

export type IPreviewQuery = {
  __typename?: "Query";
  preview: {
    __typename?: "Preview";
    title: string | null;
    dateAdded: any | null;
    id: string | null;
    content: string | null;
    author: { __typename?: "Author"; username: string | null } | null;
  } | null;
};

export type IUserDetailsQueryVariables = Exact<{ [key: string]: never }>;

export type IUserDetailsQuery = {
  __typename?: "Query";
  settings: { __typename?: "User"; username: string; email: string } | null;
  me: {
    __typename?: "Me";
    usage: {
      __typename?: "UsageDetails";
      entryCount: number;
      publicEntries: number;
      privateEntries: number;
    };
  } | null;
};

export type IUpdateEntryMutationVariables = Exact<{
  id: Scalars["String"];
  content: Scalars["String"];
  title: Scalars["String"];
  status: Scalars["Boolean"];
}>;

export type IUpdateEntryMutation = {
  __typename?: "Mutation";
  updateEntry: {
    __typename?: "Entry";
    content: string | null;
    title: string | null;
    dateAdded: any | null;
    id: string | null;
    public: boolean | null;
  } | null;
};

export type ICreateEntryMutationVariables = Exact<{
  content: Maybe<Scalars["String"]>;
  title: Maybe<Scalars["String"]>;
}>;

export type ICreateEntryMutation = {
  __typename?: "Mutation";
  createEntry: {
    __typename?: "Entry";
    title: string | null;
    dateAdded: any | null;
    id: string | null;
    public: boolean | null;
  } | null;
};

export type IRemoveEntryMutationVariables = Exact<{
  id: Scalars["ID"];
}>;

export type IRemoveEntryMutation = {
  __typename?: "Mutation";
  deleteEntry: {
    __typename?: "Entry";
    title: string | null;
    id: string | null;
  } | null;
};

export type ILoginUserMutationVariables = Exact<{
  username: Scalars["String"];
  password: Scalars["String"];
}>;

export type ILoginUserMutation = {
  __typename?: "Mutation";
  authenticateUser: { __typename?: "AuthUserPayload"; token: string | null } | null;
};

export type ICreateUserMutationVariables = Exact<{
  username: Scalars["String"];
  email: Scalars["String"];
  password: Scalars["String"];
}>;

export type ICreateUserMutation = {
  __typename?: "Mutation";
  createUser: { __typename?: "AuthUserPayload"; token: string | null } | null;
};

export type IUpdateUserSettingsMutationVariables = Exact<{
  settings: IUserSettingsInput;
}>;

export type IUpdateUserSettingsMutation = {
  __typename?: "Mutation";
  updateUserSettings: {
    __typename?: "User";
    username: string;
    email: string;
  } | null;
};

export type IUpdatePasswordMutationVariables = Exact<{
  current: Scalars["String"];
  newPassword: Scalars["String"];
}>;

export type IUpdatePasswordMutation = {
  __typename?: "Mutation";
  updatePassword: { __typename?: "AuthUserPayload"; token: string | null } | null;
};

export type IIsMeQueryVariables = Exact<{ [key: string]: never }>;

export type IIsMeQuery = {
  __typename?: "Query";
  me: { __typename?: "Me"; token: string | null } | null;
};

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

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
  AuthUserPayload: ResolverTypeWrapper<IAuthUserPayload>;
  Author: ResolverTypeWrapper<IAuthor>;
  Boolean: ResolverTypeWrapper<Scalars["Boolean"]>;
  Date: ResolverTypeWrapper<Scalars["Date"]>;
  Entry: ResolverTypeWrapper<IEntry>;
  ID: ResolverTypeWrapper<Scalars["ID"]>;
  Int: ResolverTypeWrapper<Scalars["Int"]>;
  Me: ResolverTypeWrapper<IMe>;
  Mutation: ResolverTypeWrapper<{}>;
  Preview: ResolverTypeWrapper<IPreview>;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars["String"]>;
  UsageDetails: ResolverTypeWrapper<IUsageDetails>;
  User: ResolverTypeWrapper<IUser>;
  UserSettingsInput: IUserSettingsInput;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type IResolversParentTypes = ResolversObject<{
  AuthUserPayload: IAuthUserPayload;
  Author: IAuthor;
  Boolean: Scalars["Boolean"];
  Date: Scalars["Date"];
  Entry: IEntry;
  ID: Scalars["ID"];
  Int: Scalars["Int"];
  Me: IMe;
  Mutation: {};
  Preview: IPreview;
  Query: {};
  String: Scalars["String"];
  UsageDetails: IUsageDetails;
  User: IUser;
  UserSettingsInput: IUserSettingsInput;
}>;

export type IAuthUserPayloadResolvers<
  ContextType = any,
  ParentType extends IResolversParentTypes["AuthUserPayload"] = IResolversParentTypes["AuthUserPayload"]
> = ResolversObject<{
  token: Resolver<Maybe<IResolversTypes["String"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type IAuthorResolvers<
  ContextType = any,
  ParentType extends IResolversParentTypes["Author"] = IResolversParentTypes["Author"]
> = ResolversObject<{
  gradient: Resolver<
    Maybe<Array<Maybe<IResolversTypes["String"]>>>,
    ParentType,
    ContextType
  >;
  username: Resolver<Maybe<IResolversTypes["String"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface IDateScalarConfig
  extends GraphQLScalarTypeConfig<IResolversTypes["Date"], any> {
  name: "Date";
}

export type IEntryResolvers<
  ContextType = any,
  ParentType extends IResolversParentTypes["Entry"] = IResolversParentTypes["Entry"]
> = ResolversObject<{
  author: Resolver<Maybe<IResolversTypes["Author"]>, ParentType, ContextType>;
  content: Resolver<Maybe<IResolversTypes["String"]>, ParentType, ContextType>;
  dateAdded: Resolver<Maybe<IResolversTypes["Date"]>, ParentType, ContextType>;
  dateModified: Resolver<Maybe<IResolversTypes["Date"]>, ParentType, ContextType>;
  excerpt: Resolver<Maybe<IResolversTypes["String"]>, ParentType, ContextType>;
  id: Resolver<Maybe<IResolversTypes["ID"]>, ParentType, ContextType>;
  public: Resolver<Maybe<IResolversTypes["Boolean"]>, ParentType, ContextType>;
  title: Resolver<Maybe<IResolversTypes["String"]>, ParentType, ContextType>;
  user: Resolver<Maybe<IResolversTypes["String"]>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type IMeResolvers<
  ContextType = any,
  ParentType extends IResolversParentTypes["Me"] = IResolversParentTypes["Me"]
> = ResolversObject<{
  details: Resolver<Maybe<IResolversTypes["User"]>, ParentType, ContextType>;
  token: Resolver<Maybe<IResolversTypes["String"]>, ParentType, ContextType>;
  usage: Resolver<IResolversTypes["UsageDetails"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type IMutationResolvers<
  ContextType = any,
  ParentType extends IResolversParentTypes["Mutation"] = IResolversParentTypes["Mutation"]
> = ResolversObject<{
  authenticateUser: Resolver<
    Maybe<IResolversTypes["AuthUserPayload"]>,
    ParentType,
    ContextType,
    RequireFields<IMutationAuthenticateUserArgs, "password" | "username">
  >;
  createEntry: Resolver<
    Maybe<IResolversTypes["Entry"]>,
    ParentType,
    ContextType,
    RequireFields<IMutationCreateEntryArgs, never>
  >;
  createUser: Resolver<
    Maybe<IResolversTypes["AuthUserPayload"]>,
    ParentType,
    ContextType,
    RequireFields<IMutationCreateUserArgs, "email" | "password" | "username">
  >;
  deleteEntry: Resolver<
    Maybe<IResolversTypes["Entry"]>,
    ParentType,
    ContextType,
    RequireFields<IMutationDeleteEntryArgs, "id">
  >;
  updateEntry: Resolver<
    Maybe<IResolversTypes["Entry"]>,
    ParentType,
    ContextType,
    RequireFields<IMutationUpdateEntryArgs, "content" | "id" | "status" | "title">
  >;
  updatePassword: Resolver<
    Maybe<IResolversTypes["AuthUserPayload"]>,
    ParentType,
    ContextType,
    RequireFields<IMutationUpdatePasswordArgs, "currentPassword" | "newPassword">
  >;
  updateUserSettings: Resolver<
    Maybe<IResolversTypes["User"]>,
    ParentType,
    ContextType,
    RequireFields<IMutationUpdateUserSettingsArgs, "settings">
  >;
}>;

export type IPreviewResolvers<
  ContextType = any,
  ParentType extends IResolversParentTypes["Preview"] = IResolversParentTypes["Preview"]
> = ResolversObject<{
  author: Resolver<Maybe<IResolversTypes["Author"]>, ParentType, ContextType>;
  content: Resolver<Maybe<IResolversTypes["String"]>, ParentType, ContextType>;
  dateAdded: Resolver<Maybe<IResolversTypes["Date"]>, ParentType, ContextType>;
  id: Resolver<Maybe<IResolversTypes["ID"]>, ParentType, ContextType>;
  title: Resolver<Maybe<IResolversTypes["String"]>, ParentType, ContextType>;
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
  me: Resolver<Maybe<IResolversTypes["Me"]>, ParentType, ContextType>;
  preview: Resolver<
    Maybe<IResolversTypes["Preview"]>,
    ParentType,
    ContextType,
    RequireFields<IQueryPreviewArgs, "id">
  >;
  settings: Resolver<Maybe<IResolversTypes["User"]>, ParentType, ContextType>;
}>;

export type IUsageDetailsResolvers<
  ContextType = any,
  ParentType extends IResolversParentTypes["UsageDetails"] = IResolversParentTypes["UsageDetails"]
> = ResolversObject<{
  entryCount: Resolver<IResolversTypes["Int"], ParentType, ContextType>;
  privateEntries: Resolver<IResolversTypes["Int"], ParentType, ContextType>;
  publicEntries: Resolver<IResolversTypes["Int"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type IUserResolvers<
  ContextType = any,
  ParentType extends IResolversParentTypes["User"] = IResolversParentTypes["User"]
> = ResolversObject<{
  admin: Resolver<Maybe<IResolversTypes["Boolean"]>, ParentType, ContextType>;
  email: Resolver<IResolversTypes["String"], ParentType, ContextType>;
  username: Resolver<IResolversTypes["String"], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type IResolvers<ContextType = any> = ResolversObject<{
  AuthUserPayload: IAuthUserPayloadResolvers<ContextType>;
  Author: IAuthorResolvers<ContextType>;
  Date: GraphQLScalarType;
  Entry: IEntryResolvers<ContextType>;
  Me: IMeResolvers<ContextType>;
  Mutation: IMutationResolvers<ContextType>;
  Preview: IPreviewResolvers<ContextType>;
  Query: IQueryResolvers<ContextType>;
  UsageDetails: IUsageDetailsResolvers<ContextType>;
  User: IUserResolvers<ContextType>;
}>;
