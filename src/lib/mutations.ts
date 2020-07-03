import { ApolloError } from "apollo-server-micro";
import { v4 as uuid } from "uuid";
import { ResolverContext, verifyUser } from "./queries";
import { PostModel, UserModel } from "./models";
import { mergeUpdatedPost } from "./transform";
import dbConnect from "./db";
import { getSaltedHash, createToken } from "./token";
import { setTokenCookie } from "./cookie-managment";

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

// TODO: This is WRONG
export async function updatePost(
  context: ResolverContext,
  id: string,
  body: IMutationCreateEntryVars
) {
  return verifyUser(context, async ({ user }) => {
    const ref = await PostModel.findOne({
      id,
      user: { $eq: user }
    });
    if (ref !== null) {
      return mergeUpdatedPost(body, ref, id);
    }
    throw new ApolloError("Could not find post to update");
  });
}

export async function verifyUniqueUser(username: string, email: string) {
  const user = await UserModel.findOne({
    $or: [{ email }, { username }]
  });

  if (user) {
    if (user.username === username) {
      throw new ApolloError("Username taken");
    }
    if (user.email === email) {
      throw new ApolloError("Email taken");
    }
  }
}

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

export async function authenticateUser(
  context: ResolverContext,
  username: string,
  email: string,
  password: string
) {
  await dbConnect();
}

export async function createUser(
  context: ResolverContext,
  username: string,
  email: string,
  password: string
) {
  await dbConnect();

  await verifyUniqueUser(username, email);

  try {
    const id = uuid();
    const hash = getSaltedHash(password);
    let user = await UserModel.create(
      Object.assign({}, { email, username, id, password: hash, admin: false })
    );
    let token = createToken(user);

    setTokenCookie(context.res, token);

    return { token };
  } catch (error) {
    throw new ApolloError(error);
  }
}
