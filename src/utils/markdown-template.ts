import format from "date-fns/format";
import { draftjsToMd } from "draftjs-md-converter";

// import { draftToMarkdown } from "../editor";
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

export const createMarkdown = (
  title: string,
  content: string,
  date?: Date
): string => `
---
title: ${title}
${date && `dateAdded: ${format(new Date(date), "dd MMMM yyyy")}`}
---

${content}
`;
