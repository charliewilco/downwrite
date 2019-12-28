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
    async feed(_, __, { dataSources }) {
      const feed = await dataSources.dwnxtAPI.getFeed();

      return feed;
    },
    async entry(_, { id }, { dataSources }) {
      const entry = await dataSources.dwnxtAPI.getEntry(id);
      return entry;
    },
    async preview(_, { id }, { dataSources }) {
      const md = await dataSources.dwnxtAPI.getPreview(id);
      return md;
    }
  },
  Mutation: {
    async createEntry(
      _,
      { title, content }: IMutationCreateEntryVars,
      { dataSources }
    ) {
      const entry = await dataSources.dwnxtAPI.createPost(title, content);

      return entry;
    },
    updateEntry() {},

    async deleteEntry(_, { id }, { dataSources }) {
      const post = await dataSources.dwnxtAPI.removeEntry(id);
      return post;
    },
    createUser() {},
    authenticateUser() {},
    updateUserSettings() {}
  }
};
