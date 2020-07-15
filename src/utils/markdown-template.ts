import format from "date-fns/format";
import { draftToMarkdown } from "markdown-draft-js";
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
  return draftToMarkdown(content, {
    preserveNewlines: true,
    entityItems: {
      LINK: {
        open: () => {
          return "[";
        },

        close: (entity: any) => {
          return `](${entity.data.url || entity.data.href})`;
        }
      }
    }
  });
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
