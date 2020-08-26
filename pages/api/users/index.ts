import { NextApiRequest, NextApiResponse } from "next";
import Boom from "@hapi/boom";
import { createUserHandler } from "../../../legacy/users";
import { dbConnect } from "../../../legacy/util/db";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "POST": {
      await dbConnect();
      await createUserHandler(req, res);
    }
    default:
      const e = Boom.methodNotAllowed();
      res.status(e.output.statusCode).json(e.output.payload);
  }
};
