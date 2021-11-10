import { ApolloError, UserInputError } from "apollo-server-micro";
import is from "@sindresorhus/is";

import dbConnect from "./db";
import { PostModel, UserModel, IUserModel } from "./models";
import {
  transformPostsToFeed,
  transformPostToEntry,
  transformMDToPreview
} from "./transform";
import { ResolverContext } from "./context";
import { verifyUser } from "./resolver-auth";

import type { Many } from "@shared/types";
import { __IS_DEV__ } from "@shared/constants";
import type { IEntry, IQueryResolvers, IUser } from "../__generated__/server";

export const Query: IQueryResolvers<ResolverContext> = {
  feed: async (_, __, context) => feed(context),
  entry: async (_, { id }, context) => entry(context, id),
  preview: async (_, { id }, context) => preview(context, id),
  settings: async (_, __, context) => settings(context),
  me: async (_, __, context) => me(context)
};

export async function me(context: ResolverContext) {
  return verifyUser(context, async ({ user, name, token }) => {
    const entryCount = await PostModel.count({ user: { $eq: user } });
    const publicEntries = await PostModel.count({
      public: true,
      user: { $eq: user }
    });
    const _user = await UserModel.findById(user, "username email").exec();

    if (is.nullOrUndefined(_user)) {
      throw new ApolloError("Cannot find user");
    }

    const { email } = _user;

    return {
      token,
      usage: {
        entryCount,
        publicEntries,
        privateEntries: entryCount - publicEntries
      },
      details: {
        email,
        username: name,
        id: user,
        admin: __IS_DEV__
      }
    };
  });
}

export async function feed(context: ResolverContext): Promise<IEntry[]> {
  return verifyUser(context, async ({ user }) => {
    try {
      const posts = await PostModel.find({ user: { $eq: user } });
      return transformPostsToFeed(posts);
    } catch (error: any) {
      throw new ApolloError(error.message);
    }
  });
}

export async function entry(context: ResolverContext, id: string): Promise<IEntry> {
  return verifyUser(context, async ({ user }) => {
    try {
      const post = await PostModel.findOne({
        id,
        user: { $eq: user }
      });
      return transformPostToEntry(post);
    } catch (error: any) {
      throw new ApolloError(error.message);
    }
  });
}

export async function preview(_: ResolverContext, id: string) {
  await dbConnect();
  const post = await PostModel.findOne({ id });
  const user = await UserModel.findOne({ _id: post!.user });

  if (user === null) {
    throw new ApolloError("Author could not be found");
  }

  if (post === null) {
    throw new ApolloError("Post doesn't exist");
  }

  if (!post.public) {
    throw new UserInputError(
      "This post is either not public or I couldn't even find it. Things are hard sometimes.",
      {
        invalidArgs: [id]
      }
    );
  }

  return transformMDToPreview(post, user);
}

export async function settings(context: ResolverContext): Promise<IUser> {
  return verifyUser(context, async ({ user }) => {
    const details: Many<Pick<IUserModel, "username" | "email">> | null =
      await UserModel.findById(user, "username email").exec();
    if (details !== null) {
      const user = Array.isArray(details) ? details[0] : details;
      return {
        email: user.email!,
        id: user.id,
        admin: false,
        username: user.username!
      };
    } else {
      throw new ApolloError("Could not find user settings");
    }
  });
}
