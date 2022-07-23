import { GraphQLYogaError } from "@graphql-yoga/node";
import { UserModel, IUserModel } from "./models";
import { isValidPassword, IReadResults } from "./token";
import type { ResolverContext } from "./context";
import { getUserTokenContents } from "./cookie-managment";
import dbConnect from "./db";

export async function verifyUser<T>(
  context: ResolverContext,
  cb: (user: IReadResults) => T
) {
  const token = getUserTokenContents(context.req);

  if (token) {
    await dbConnect();

    return cb(token);
  } else {
    throw new GraphQLYogaError("No valid token in cookie");
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

    throw new GraphQLYogaError("Incorrect password");
  } else {
    throw new GraphQLYogaError("Incorrect username or email!");
  }
}
