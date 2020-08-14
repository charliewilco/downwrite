import { NextApiRequest, NextApiResponse } from "next";
import { authenticationHandler } from "../../../legacy/users";
import { dbConnect } from "../../../legacy/util/db";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();

  await authenticationHandler(req, res);
};
