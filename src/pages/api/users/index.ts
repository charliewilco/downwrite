import { NextApiHandler } from "next";
import { methodNotAllowed } from "@legacy/common";
import { createUserHandler } from "@legacy/users";
import { dbConnect } from "@legacy/util/db";

const handler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case "POST": {
      await dbConnect();
      await createUserHandler(req, res);
      break;
    }
    default:
      await methodNotAllowed(req, res);
  }
};

export default handler;
