import { ApolloError, AuthenticationError } from "apollo-server-micro";
import { GetServerSidePropsContext } from "next";
import dbConnect from "./db";
import { PostModel } from "./models";
import { transformPostsToFeed, transformPostToEntry } from "./transform";
import { getUserToken } from "./cookie-managment";

export type ResolverContext = Pick<GetServerSidePropsContext, "req" | "res">;

export async function feed(context: ResolverContext) {
  const token = getUserToken(context.req);

  if (token) {
    await dbConnect();

    try {
      const posts = await PostModel.find({ user: { $eq: token.user } });
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

export async function preview(context: ResolverContext, id: string) {}
