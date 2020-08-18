import { NextApiRequest, NextApiResponse } from "next";
import { createUserHandler } from "../../../legacy/users";
import { dbConnect } from "../../../legacy/util/db";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  await dbConnect();

  switch (req.method) {
    case "POST": {
      await createUserHandler(req, res);
      break;
    }
    default:
      break;
  }
};
