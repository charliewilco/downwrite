/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-console */
import { IResolvers } from "apollo-server-micro";
import { IContext, DownwriteAPI } from "./data-source";

export interface IResolverContext extends IContext {
  dataSources: {
    dwnxtAPI: DownwriteAPI;
  };
}

export interface IMutationCreateEntryVars {
  title: string;
  content: string;
  id?: string;
  status?: boolean;
}

export interface IMutationUserVars {
  email?: string;
  password: string;
  username: string;
}

export const resolvers: IResolvers<unknown, IResolverContext> = {
  Query: {
    feed: async (_, __, { dataSources }) => dataSources.dwnxtAPI.getFeed(),
    entry: async (_, { id }, { dataSources }) => dataSources.dwnxtAPI.getEntry(id),
    preview: async (_, { id }, { dataSources }) =>
      dataSources.dwnxtAPI.getPreview(id),
    settings: async (_, __, { dataSources }) => dataSources.dwnxtAPI.getUserDetails()
  },

  Mutation: {
    createEntry: async (_, args: IMutationCreateEntryVars, { dataSources }) =>
      dataSources.dwnxtAPI.createPost(args.title, args.content),
    updateEntry: async (
      _,
      { id, ...body }: IMutationCreateEntryVars,
      { dataSources }
    ) => dataSources.dwnxtAPI.updatePost(id!, body),
    deleteEntry: async (_, { id }, { dataSources }) =>
      dataSources.dwnxtAPI.removeEntry(id),
    createUser: async (_, args: IMutationUserVars, { dataSources }) =>
      dataSources.dwnxtAPI.createUser(args),
    authenticateUser: async (_, args: IMutationUserVars, { dataSources }) =>
      dataSources.dwnxtAPI.authenticateUser(args.username, args.password),
    updateUserSettings() {}
  }
};
