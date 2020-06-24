/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-console */
import { IResolvers } from "apollo-server-micro";
import { GetServerSidePropsContext } from "next";
import { ResolverContext, feed, entry, preview, settings } from "./queries";
import {
  IMutationCreateEntryVars,
  IMutationUserVars,
  createPost,
  updatePost
} from "./mutations";

export interface IResolverContext
  extends Pick<GetServerSidePropsContext, "req" | "res"> {}

export const resolvers: IResolvers<unknown, ResolverContext> = {
  Query: {
    feed: async (_, __, context) => feed(context),
    entry: async (_, { id }, context) => entry(context, id),
    preview: async (_, { id }, context) => preview(context, id),
    settings: async (_, __, context) => settings(context)
  },

  Mutation: {
    createEntry: async (_, args: IMutationCreateEntryVars, context) =>
      createPost(context),
    updateEntry: async (_, { id, ...body }: IMutationCreateEntryVars, context) =>
      updatePost(context, id!, body),
    deleteEntry: async (_, { id }, context) =>
      console.log("delete entry", context, id),
    createUser: async (_, args: IMutationUserVars, context) =>
      console.log("create user", context),
    authenticateUser: async (_, args: IMutationUserVars, context) =>
      console.log("authenticate user", context, args.username, args.password),
    updateUserSettings() {}
  }
};
