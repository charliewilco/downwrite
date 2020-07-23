import { ApolloError, UserInputError } from "apollo-server-micro";
import dbConnect from "./db";
import { PostModel, UserModel, IUserModel } from "./models";
import {
  transformPostsToFeed,
  transformPostToEntry,
  transformMDToPreview
} from "./transform";
import { ResolverContext, verifyUser } from "./context";
import { IEntry, IQueryResolvers, IUser } from "@utils/resolvers";
import { Many } from "@utils/types";

export const Query: IQueryResolvers<ResolverContext> = {
  feed: async (_, __, context) => feed(context),
  entry: async (_, { id }, context) => entry(context, id),
  preview: async (_, { id }, context) => preview(context, id),
  settings: async (_, __, context) => settings(context)
};

export async function feed(context: ResolverContext): Promise<IEntry[]> {
  return verifyUser(context, async ({ user }) => {
    try {
      const posts = await PostModel.find({ user: { $eq: user } });
      return transformPostsToFeed(posts);
    } catch (error) {
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
    } catch (error) {
      throw new ApolloError(error.message);
    }
  });
}

export async function preview(_: ResolverContext, id: string) {
  await dbConnect();
  const post = await PostModel.findOne({ id });
  const user = await UserModel.findOne({ _id: post!.user });

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
    const details: Many<
      Pick<IUserModel, "username" | "email">
    > | null = await UserModel.findById(user, ["username", "email"]).lean();
    if (details !== null) {
      const user = Array.isArray(details) ? details[0] : details;
      return { email: user.email!, admin: false, username: user.username! };
    } else {
      throw new ApolloError("Could not find user settings");
    }
  });
}
