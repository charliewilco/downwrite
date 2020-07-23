import { GetServerSidePropsContext } from "next";
import { AuthenticationError } from "apollo-server-micro";
import { TokenContents } from "@lib/token";
import { getUserToken } from "@lib/cookie-managment";
import dbConnect from "@lib/db";

export type ResolverContext = Pick<GetServerSidePropsContext, "req" | "res">;

export async function verifyUser<T>(
  context: ResolverContext,
  cb: (user: TokenContents) => T
) {
  const token = getUserToken(context.req);
  console.log("TOKEN", token);

  if (token) {
    await dbConnect();

    return cb(token);
  } else {
    throw new AuthenticationError("No valid token in cookie");
  }
}
