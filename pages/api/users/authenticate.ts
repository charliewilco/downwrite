import { NextApiRequest, NextApiResponse } from "next";
import { methodNotAllowed } from "@legacy/common";
import { authenticationHandler } from "@legacy/users";
import { dbConnect } from "@legacy/util/db";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "POST": {
      await dbConnect();
      await authenticationHandler(req, res);
      break;
    }
    default:
      await methodNotAllowed(req, res);
  }
};
