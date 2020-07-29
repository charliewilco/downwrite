import { GetServerSidePropsContext } from "next";
import { ApolloError, AuthenticationError } from "apollo-server-micro";
import { TokenContents, isValidPassword } from "@lib/token";
import { UserModel, IUserModel } from "@lib/models";
import { getUserToken } from "@lib/cookie-managment";
import dbConnect from "@lib/db";

export type ResolverContext = Pick<GetServerSidePropsContext, "req" | "res">;

export async function verifyUser<T>(
  context: ResolverContext,
  cb: (user: TokenContents) => T
) {
  const token = getUserToken(context.req);

  if (token) {
    await dbConnect();

    return cb(token);
  } else {
    throw new AuthenticationError("No valid token in cookie");
  }
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

export async function isUniqueUser(username: string): Promise<boolean> {
  console.log(username);

  return false;
}
