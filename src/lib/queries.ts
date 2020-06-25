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
import { createMarkdownServer } from "../utils";

export type ResolverContext = Pick<GetServerSidePropsContext, "req" | "res">;

export async function verifyUser<T>(
  context: ResolverContext,
  cb: (user: string) => T
) {
  const token = getUserToken(context.req);
  console.log("Token", token);

  if (token) {
    await dbConnect();

    if (cb) {
      return cb(token.user);
    }
  } else {
    throw new AuthenticationError("No valid token in cookie");
  }
}

export async function feed(context: ResolverContext) {
  const token = getUserToken(context.req);

  if (token) {
    await dbConnect();

    try {
      const posts = await PostModel.find({ user: { $eq: token.user } });
      console.log(transformPostsToFeed(posts).map(p => p.title));
      return transformPostsToFeed(posts);
    } catch (error) {
      throw new ApolloError(error.message);
    }
  } else {
    throw new AuthenticationError("No valid token in cookie");
  }
}

export async function entry(context: ResolverContext, id: string) {
  const token = getUserToken(context.req);

  if (token) {
    await dbConnect();
    try {
      const post = await PostModel.findOne({
        id,
        user: { $eq: token.user }
      });
      return transformPostToEntry(post);
    } catch (error) {
      throw new ApolloError(error.message);
    }
  } else {
    throw new AuthenticationError("No valid token in cookie");
  }
}

export async function preview(context: ResolverContext, id: string) {
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
  const token = getUserToken(context.req);

  if (token) {
    const details = await UserModel.findById(token.user, [
      "username",
      "email"
    ]).lean();
    return details;
  } else {
    throw new AuthenticationError("No valid token in cookie");
  }
}
