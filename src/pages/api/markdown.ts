import { NextApiRequest, NextApiResponse } from "next";
import { mdToDraftjs, draftjsToMd } from "draftjs-md-converter";

export default async function markdown(
  { body, query }: NextApiRequest,
  res: NextApiResponse
) {
  const q = !!query && Array.isArray(query) ? query.join("") : query;
  const isFromMarkdown = q === "fromMarkdown";
  if (isFromMarkdown) {
    const { markdown } = body;

    const editorState = mdToDraftjs(markdown);

    res.json({ editorState });
  } else {
    const { rawEditorState } = body;

    const md = draftjsToMd(rawEditorState);
    res.json({ markdown: md });
  }
}
