import { draftjsToMd } from "draftjs-md-converter";

import is from "@sindresorhus/is";

export function createMarkdownServer(
  content: Draft.RawDraftContentState | string
): string {
  if (is.string(content)) {
    return content;
  }

  if (content === undefined) {
    return "";
  }
  return draftjsToMd(content);
}
