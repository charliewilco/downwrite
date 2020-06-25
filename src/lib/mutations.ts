import { AuthenticationError, ApolloError } from "apollo-server-micro";
import uuid from "uuid/v4";
import { getUserToken } from "./cookie-managment";
import { ResolverContext } from "./queries";
import { PostModel, IPostModel } from "./models";
import {} from "./transform";
import dbConnect from "./db";

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

export async function createPost(
  context: ResolverContext,
  { title, content }: IMutationCreateEntryVars
) {
  const token = getUserToken(context.req);

  if (token) {
    await dbConnect();
    try {
      const id = uuid();
      const date = new Date();

      const entry = {
        title,
        content,
        id,
        public: false,
        dateAdded: date,
        dateModified: date,
        user: token.user,
        author: token.name
      };

      const post = await PostModel.create(entry);
      return post;
    } catch (error) {
      throw new ApolloError(error);
    }
  } else {
    throw new AuthenticationError("No valid token in cookies");
  }
}

export async function updatePost(
  context: ResolverContext,
  id: string,
  body: IMutationCreateEntryVars
) {}

export async function removePost(context: ResolverContext, id: string) {
  const token = getUserToken(context.req);
  if (token) {
    await dbConnect();

    try {
      const post = await PostModel.findOneAndRemove({
        id,
        user: { $eq: token.user }
      });
      return post;
    } catch (error) {}
  } else {
    throw new AuthenticationError("No valid token in cookies");
  }
}

export async function authenticateUser() {}

export async function createUser() {}
