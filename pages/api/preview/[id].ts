import { getPreviewHandler } from "@legacy/posts";
import { methodNotAllowed } from "@legacy/common";
import { dbConnect } from "@legacy/util/db";
import { NextApiHandler } from "next";

const handler: NextApiHandler = async (req, res) => {
  switch (req.method) {
    case "GET": {
      await dbConnect();
      await getPreviewHandler(req, res);
    }
    default: {
      await methodNotAllowed(req, res);
    }
  }
};

export default handler;
