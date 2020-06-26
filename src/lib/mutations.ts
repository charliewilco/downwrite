import { ApolloError } from "apollo-server-micro";
import { v4 as uuid } from "uuid";
import { ResolverContext, verifyUser } from "./queries";
import { PostModel } from "./models";
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
  return verifyUser(context, async ({ user, name }) => {
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
        user,
        author: name
      };

      const post = await PostModel.create(entry);
      return post;
    } catch (error) {
      throw new ApolloError(error);
    }
  });
}

export async function updatePost(
  context: ResolverContext,
  id: string,
  body: IMutationCreateEntryVars
) {}

export async function removePost(context: ResolverContext, id: string) {
  return verifyUser(context, async ({ user }) => {
    try {
      const post = await PostModel.findOneAndRemove({
        id,
        user: { $eq: user }
      });
      return post;
    } catch (error) {}
  });
}

export async function authenticateUser() {}

export async function createUser() {}
