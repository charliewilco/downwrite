/* eslint-disable @typescript-eslint/no-non-null-assertion */
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
    async feed(_, __, context) {
      const feed = await context.dataSources.dwnxtAPI.getFeed();

      return feed;
    },
    async entry(_, { id }, context) {
      const entry = await context.dataSources.dwnxtAPI.getEntry(id);
      return entry;
    },
    async preview(_, { id }, context) {
      const md = await context.dataSources.dwnxtAPI.getPreview(id);
      return md;
    },
    async settings(_, __, context) {
      const user = await context.dataSources.dwnxtAPI.getUserDetails();
      return user;
    }
  },

  Mutation: {
    async createEntry(_, args: IMutationCreateEntryVars, context) {
      const entry = await context.dataSources.dwnxtAPI.createPost(
        args.title,
        args.content
      );

      return entry;
    },
    async updateEntry(_, args: IMutationCreateEntryVars, context) {
      const { id, ...body } = args;

      const post = await context.dataSources.dwnxtAPI.updatePost(id!, body);
      return post;
    },
    async deleteEntry(_, { id }, context) {
      const post = await context.dataSources.dwnxtAPI.removeEntry(id);
      return post;
    },
    async createUser(_, args: IMutationUserVars, context) {
      const { token } = await context.dataSources.dwnxtAPI.createUser(args);

      return { token };
    },
    async authenticateUser(_, args: IMutationUserVars, context) {
      const { token } = await context.dataSources.dwnxtAPI.authenticateUser(
        args.username,
        args.password
      );
      return { token };
    },
    updateUserSettings() {}
  }
};