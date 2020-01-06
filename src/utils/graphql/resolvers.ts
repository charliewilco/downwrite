/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-console */
import { IResolvers } from "apollo-server-micro";
import { IContext, DownwriteAPI } from "./data-source";
const { TransformResponses } = require("./transform");

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
const normalize = new TransformResponses();

export const resolvers: IResolvers<unknown, IResolverContext> = {
  Query: {
    async feed(_, __, context) {
      if (context.dataSources) {
        const feed = await context.dataSources.dwnxtAPI.getFeed();

        return feed;
      } else {
        console.log(context, "Context from Resolver");
        const r = await fetch("http://localhost:4000/api/posts", {
          headers: {
            Authorization: context.token
          }
        }).then(res => res.json());
        return normalize.transformPostsToFeed(r);
      }
    },
    async entry(_, { id }, context) {
      const entry = await context.dataSources.dwnxtAPI.getEntry(id);
      return entry;
    },
    async preview(_, { id }, context) {
      if (context.dataSources) {
        const md = await context.dataSources.dwnxtAPI.getPreview(id);
        return md;
      } else {
        const response = await fetch(
          "http://localhost:4000/api/posts/preview/" + id
        ).then(res => res.json());

        return normalize.transformMDToPreview(response, {});
      }
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
