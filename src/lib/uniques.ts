import { ApolloError } from "apollo-server-micro";
import { UserModel, IUserModel } from "@lib/models";

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

export function getUniqueChecks(
  currentUser: IUserModel,
  email: string,
  username: string
) {
  const differences = isDifferent(currentUser, email!, username!);

  const uniqueChecks = differences.map(async (diff) => {
    const params = diff === "username" ? { username: username! } : { email: email! };
    const found = await UserModel.findOne(params);

    if (found) {
      if (diff === "username" && found.username === username) {
        throw new ApolloError("Username already taken");
      }
      if (diff === "email" && found.email === email) {
        throw new ApolloError("Email already taken");
      }
    }
  });

  return uniqueChecks;
}
