import { ApolloError, AuthenticationError } from "apollo-server-micro";
import { v4 as uuid } from "uuid";
import { ResolverContext, verifyUser } from "@lib/context";
import { PostModel, UserModel, IUserModel } from "@lib/models";
import { transformPostToEntry } from "@lib/transform";
import dbConnect from "@lib/db";
import { getSaltedHash, createToken, isValidPassword } from "@lib/token";
import { setTokenCookie } from "@lib/cookie-managment";
import {
  RequireFields,
  IEntry,
  IUser,
  IMutationResolvers,
  IMutationCreateEntryArgs,
  IMutationUpdateEntryArgs,
  IMutationDeleteEntryArgs,
  IMutationUpdateUserSettingsArgs
} from "@utils/resolvers";
import { __IS_DEV__ } from "@utils/dev";

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

export const Mutation: IMutationResolvers<ResolverContext> = {
  createEntry: async (_, args, context) => createPost(context, args),
  updateEntry: async (_, args, context) => updatePost(context, args.id, args),
  deleteEntry: async (_, args, context) => removePost(context, args),
  createUser: async (_, args: IMutationUserVars, context) =>
    createUser(context, args.username, args.email!, args.password),
  authenticateUser: async (_, args: IMutationUserVars, context) =>
    authenticateUser(context, args.username, args.password),
  updateUserSettings: async (_, args, context) => updateUserSettings(context, args)
};

export async function createPost(
  context: ResolverContext,
  args: RequireFields<IMutationCreateEntryArgs, never>
): Promise<IEntry> {
  return verifyUser(context, async ({ user, name }) => {
    try {
      const id = uuid();
      const date = new Date();
      const title = args.title ?? "Untitled Entry";
      const content = args.content ?? "";

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
      return transformPostToEntry(post);
    } catch (error) {
      throw new ApolloError(error);
    }
  });
}

export async function updatePost(
  context: ResolverContext,
  id: string,
  args: IMutationUpdateEntryArgs
) {
  return verifyUser(context, async ({ user }) => {
    try {
      const n = await PostModel.findOneAndUpdate(
        { id, user: { $eq: user } },
        {
          content: args.content,
          public: args.status,
          title: args.title,
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

export async function removePost(
  context: ResolverContext,
  { id }: RequireFields<IMutationDeleteEntryArgs, "id">
): Promise<IEntry> {
  return verifyUser(context, async ({ user }) => {
    try {
      const post = await PostModel.findOneAndRemove({
        id,
        user: { $eq: user }
      });
      return transformPostToEntry(post);
    } catch (error) {
      throw new ApolloError(error);
    }
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

export async function updateUserSettings(
  context: ResolverContext,
  args: RequireFields<IMutationUpdateUserSettingsArgs, "settings">
): Promise<IUser> {
  return verifyUser(context, async ({ user }) => {
    const details = await UserModel.findByIdAndUpdate(
      {
        _id: user
      },
      { $set: { username: args.settings.username, email: args.settings.email } },
      { new: true, select: "username email" }
    );
    if (details.email && details.username) {
      return { email: details.email, username: details.username, admin: __IS_DEV__ };
    } else {
      throw new ApolloError("Couldn't update user settings");
    }
  });
}
