import { NextApiHandler } from "next";
import { mdToDraftjs, draftjsToMd } from "draftjs-md-converter";

const handler: NextApiHandler = async ({ body, query }, res) => {
  const q = !!query && Array.isArray(query) ? query.join("") : query;
  const isFromMarkdown = q === "fromMarkdown";
  if (isFromMarkdown) {
    const { markdown } = body;

    const editorState = mdToDraftjs(markdown);

    res.json({ editorState });
  } else {
    const markdown = draftjsToMd(body.rawEditorState);

    res.json({ markdown });
  }
};
export default handler;
