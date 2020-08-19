import { getPreviewHandler } from "../../../legacy/posts";
import { dbConnect } from "../../../legacy/util/db";
import { NextApiHandler } from "next";

const handler: NextApiHandler = async (req, res) => {
  await dbConnect();

  await getPreviewHandler(req, res);
};

export default handler;
