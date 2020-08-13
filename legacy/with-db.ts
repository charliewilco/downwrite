import { NextApiHandler } from "next";
import { dbConnect } from "./util/db";

export const withDB = async <T>(
  fn: NextApiHandler<T>
): Promise<NextApiHandler<T>> => {
  await dbConnect();

  return fn;
};
