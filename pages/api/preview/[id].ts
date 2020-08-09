import { NextApiRequest, NextApiResponse } from "next";
import { getMarkdownPreview } from "../../../legacy/posts";
import { dbConnect } from "../../../legacy/util/db";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;
  await dbConnect();

  const markdown = getMarkdownPreview(Array.isArray(id) ? id.join("") : id);
  res.send(markdown);
};
