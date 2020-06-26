import {
  ApolloError,
  AuthenticationError,
  UserInputError
} from "apollo-server-micro";
import { GetServerSidePropsContext } from "next";
import dbConnect from "./db";
import { PostModel, UserModel } from "./models";
import { transformPostsToFeed, transformPostToEntry } from "./transform";
import { getUserToken } from "./cookie-managment";
import { TokenContents } from "./token";
import { createMarkdownServer } from "../utils";

export type ResolverContext = Pick<GetServerSidePropsContext, "req" | "res">;

export async function verifyUser<T>(
  context: ResolverContext,
  cb: (user: TokenContents) => T
) {
  const token = getUserToken(context.req);
  console.log("Token", token);

  if (token) {
    await dbConnect();

    if (cb) {
      return cb(token);
    }
  } else {
    throw new AuthenticationError("No valid token in cookie");
  }
}

export async function feed(context: ResolverContext) {
  return verifyUser(context, async ({ user }) => {
    try {
      const posts = await PostModel.find({ user: { $eq: user } });
      return transformPostsToFeed(posts);
    } catch (error) {
      throw new ApolloError(error.message);
    }
  });
}

export async function entry(context: ResolverContext, id: string) {
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

export async function preview(context: ResolverContext, id: string) {
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

  return {
    id,
    author: {
      username: user.username,
      avatar: user.gradient || ["#FEB692", "#EA5455"]
    },
    content: createMarkdownServer(post.content),
    title: post.title,
    dateAdded: post.dateAdded
  };
}

export async function settings(context: ResolverContext) {
  return verifyUser(context, async ({ user }) => {
    const details = await UserModel.findById(user, ["username", "email"]).lean();
    return details;
  });
}