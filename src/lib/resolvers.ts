/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-console */
import { IResolvers } from "apollo-server-micro";
import { GetServerSidePropsContext } from "next";
import { ResolverContext, feed, entry } from "./queries";

export interface IResolverContext
  extends Pick<GetServerSidePropsContext, "req" | "res"> {}

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

export const resolvers: IResolvers<unknown, ResolverContext> = {
  Query: {
    feed: async (_, __, context) => feed(context),
    entry: async (_, { id }, context) => entry(context, id),
    preview: async (_, { id }, context) => console.log(context, id),
    settings: async (_, __, context) => console.log(context)
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
