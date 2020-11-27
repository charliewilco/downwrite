import { ApolloError } from "apollo-server-micro";
import { v4 as uuid } from "uuid";
import {
  ResolverContext,
  verifyUser,
  verifyUniqueUser,
  verifyCredentials
} from "@lib/context";
import { PostModel, UserModel, IUserModel } from "@lib/models";
import { transformPostToEntry } from "@lib/transform";
import dbConnect from "@lib/db";
import { getSaltedHash, createToken } from "@lib/token";
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
} from "@utils/resolver-types";
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

interface ICreateUserParams {
  email: string;
  username: string;
  id: string;
  password: string;
  admin: boolean;
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
    const m = Object.assign(
      {},
      { email, username, id, password: hash, admin: false }
    );
    let user = await UserModel.create<ICreateUserParams>(m);
    let token = createToken(user);

    setTokenCookie(context.res, token);

    return { token };
  } catch (error) {
    throw new ApolloError(error);
  }
}

type Diffs = "email" | "username";

export function isDifferent(
  user: IUserModel,
  email: string,
  username: string
): Diffs[] {
  const differences: Diffs[] = [];

  if (user.email !== email) differences.push("email");
  if (user.username !== username) differences.push("username");

  return differences;
}

export async function updateUserSettings(
  context: ResolverContext,
  {
    settings: { email, username }
  }: RequireFields<IMutationUpdateUserSettingsArgs, "settings">
): Promise<IUser> {
  return verifyUser(context, async ({ user }) => {
    const currentUser: IUserModel = await UserModel.findById({ _id: user });
    const differences = isDifferent(currentUser, email!, username!);

    for (const diff of differences) {
      if (diff === "username") {
        console.log(diff);
      }

      if (diff === "email") {
        console.log(diff);
      }
    }
    const details = await UserModel.findByIdAndUpdate(
      {
        _id: user
      },
      { $set: { username, email } },
      { new: true, select: "username email" }
    );
    if (details.email && details.username) {
      return { email: details.email, username: details.username, admin: __IS_DEV__ };
    } else {
      throw new ApolloError("Couldn't update user settings");
    }
  });
}
