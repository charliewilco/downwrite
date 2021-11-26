import { ApolloError } from "apollo-server-micro";
import * as bcrypt from "bcryptjs";
import base64 from "base-64";
import cuid from "cuid";

import { ResolverContext } from "@server/context";
import { PostModel, UserModel } from "@server/models";
import { transformPostToEntry } from "@server/transform";
import dbConnect from "@server/db";
import { getSaltedHash, createToken } from "@server/token";
import { setTokenCookie } from "@server/cookie-managment";
import { getUniqueChecks, verifyUniqueUser } from "@server/uniques";
import { verifyCredentials, verifyUser } from "@server/resolver-auth";
import { createUserArgs } from "@shared/validations";
import { __IS_DEV__ } from "@shared/constants";

import type {
  RequireFields,
  IEntry,
  IUser,
  IMutationResolvers,
  IMutationCreateEntryArgs,
  IMutationUpdateEntryArgs,
  IMutationDeleteEntryArgs,
  IMutationUpdateUserSettingsArgs,
  IAuthUserPayload,
  IMutationUpdatePasswordArgs
} from "../__generated__/server";

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
  updateUserSettings: async (_, args, context) => updateUserSettings(context, args),
  updatePassword: async (_, args, context) => updatePassword(context, args)
};

export async function createPost(
  context: ResolverContext,
  args: RequireFields<IMutationCreateEntryArgs, never>
): Promise<IEntry> {
  return verifyUser(context, async ({ user, name }) => {
    try {
      const id = cuid();
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
    } catch (error: any) {
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
    } catch (error: any) {
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
    } catch (error: any) {
      throw new ApolloError(error);
    }
  });
}

export async function authenticateUser(
  context: ResolverContext,
  username: string,
  password: string
): Promise<IAuthUserPayload> {
  const decoded = base64.decode(password);

  await dbConnect();

  try {
    const user = await verifyCredentials(username, decoded);
    const token = createToken(user);

    setTokenCookie(context.res, token);

    return { token };
  } catch (error: any) {
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
  const decoded = base64.decode(password);
  try {
    await verifyUniqueUser(username, email);
    await createUserArgs.parseAsync({
      username,
      email,
      password: decoded
    });

    const id = cuid();
    const hash = await getSaltedHash(decoded);
    const m = Object.assign(
      {},
      { email, username, id, password: hash, admin: false }
    );
    let user = await UserModel.create(m);
    let token = createToken(user);

    setTokenCookie(context.res, token);

    return { token };
  } catch (error: any) {
    console.log(error.message);
    throw new ApolloError(error);
  }
}

export async function updateUserSettings(
  context: ResolverContext,
  {
    settings: { email, username }
  }: RequireFields<IMutationUpdateUserSettingsArgs, "settings">
): Promise<IUser> {
  return verifyUser(context, async ({ user }) => {
    try {
      const currentUser = await UserModel.findById({ _id: user });

      if (currentUser === null || typeof currentUser === "undefined") {
        throw new ApolloError("user cannot be null");
      }

      const uniqueChecks = getUniqueChecks(currentUser, email!, username!);

      await Promise.all(uniqueChecks);
      const details = await UserModel.findByIdAndUpdate(
        {
          _id: user
        },
        { $set: { username: username!, email: email! } },
        { new: true }
      );
      if (details === null || typeof details === "undefined") {
        throw new ApolloError("Update failed, user details came back null");
      }
      if (details.email && details.username) {
        const token = createToken(details);

        setTokenCookie(context.res, token);
        return {
          email: details.email,
          username: details.username,
          id: details.id,
          admin: __IS_DEV__
        };
      } else {
        throw new ApolloError("Couldn't update user settings");
      }
    } catch (error: any) {
      throw new ApolloError(error);
    }
  });
}

export async function updatePassword(
  context: ResolverContext,
  { currentPassword, newPassword }: IMutationUpdatePasswordArgs
): Promise<IAuthUserPayload> {
  return verifyUser(context, async (tokenContents) => {
    const decodedNew = base64.decode(newPassword);
    const decodedCurrent = base64.decode(currentPassword);
    const user = await verifyCredentials(tokenContents.name, decodedCurrent);
    const salt = await bcrypt.genSalt(10);

    const newPasswordHash = await bcrypt.hash(decodedNew, salt);

    const updated = await UserModel.findByIdAndUpdate(
      {
        _id: user._id
      },
      { $set: { password: newPasswordHash } },
      { new: true }
    );

    if (updated === null || typeof updated === "undefined") {
      throw new ApolloError("Update failed");
    }

    const token = createToken(updated);

    setTokenCookie(context.res, token);

    return {
      token
    };
  });
}
