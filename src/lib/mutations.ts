import { ApolloError, AuthenticationError } from "apollo-server-micro";
import { v4 as uuid } from "uuid";
import { ResolverContext, verifyUser } from "./queries";
import { PostModel, UserModel, IUserModel } from "./models";
import { transformPostToEntry } from "./transform";
import dbConnect from "./db";
import { getSaltedHash, createToken, isValidPassword } from "./token";
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

export async function updatePost(
  context: ResolverContext,
  id: string,
  body: IMutationCreateEntryVars
) {
  return verifyUser(context, async ({ user }) => {
    try {
      const n = await PostModel.findOneAndUpdate(
        { id, user: { $eq: user } },
        {
          content: body.content,
          public: body.status,
          title: body.title,
          dateModified: new Date()
        },
        {
          new: true
        }
      );
      return transformPostToEntry(n);
    } catch (error) {
      throw new ApolloError(error, "Could not find post to update");
    }
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

export async function verifyCredentials(
  identifier: string,
  password: string
): Promise<IUserModel> {
  const user = await UserModel.findOne({
    $or: [{ email: identifier }, { username: identifier }]
  });

  if (user) {
    const isValid = await isValidPassword(password, user.password);
    if (isValid) return user;

    throw new AuthenticationError("Incorrect password");
  } else {
    throw new AuthenticationError("Incorrect username or email!");
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
  password: string
) {
  await dbConnect();

  try {
    const user = await verifyCredentials(username, password);
    const token = createToken(user);

    setTokenCookie(context.res, token);

    return { token };
  } catch (error) {
    throw new ApolloError(error);
  }
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
    const hash = await getSaltedHash(password);
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
