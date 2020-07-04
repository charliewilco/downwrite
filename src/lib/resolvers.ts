import { IResolvers } from "apollo-server-micro";
import { GetServerSidePropsContext } from "next";
import { ResolverContext, feed, entry, preview, settings } from "./queries";
import {
  IMutationCreateEntryVars,
  IMutationUserVars,
  createPost,
  updatePost,
  removePost,
  authenticateUser,
  createUser
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
      createPost(context, args),
    updateEntry: async (_, { id, ...body }: IMutationCreateEntryVars, context) =>
      updatePost(context, id!, body),
    deleteEntry: async (_, { id }, context) => removePost(context, id),
    createUser: async (_, args: IMutationUserVars, context) =>
      createUser(context, args.username, args.email!, args.password),
    authenticateUser: async (_, args: IMutationUserVars, context) =>
      authenticateUser(context, args.username, args.password),
    updateUserSettings() {}
  }
};
