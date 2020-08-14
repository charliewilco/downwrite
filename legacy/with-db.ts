import { NextApiHandler } from "next";
import { dbConnect } from "./util/db";

export const withDB = async <T>(
  handler: NextApiHandler<T>
): Promise<NextApiHandler<T>> => {
  await dbConnect();

  console.log(handler);
  console.log(typeof withDB);

  return (req, res) => handler(req, res);
};
