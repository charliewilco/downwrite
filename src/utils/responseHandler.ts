import * as Draft from "draft-js";
import { markdownToDraft } from "markdown-draft-js";
import { __IS_BROWSER__ } from "./dev";

export const superConverter: Function = (
  content: string | Draft.RawDraftContentState
): Draft.ContentState => {
  content = typeof content === "string" ? JSON.parse(content) : content;

  if (typeof content === "string") {
    return Draft.convertFromRaw(markdownToDraft(content));
  }

  return content.hasOwnProperty("entityMap")
    ? Draft.convertFromRaw(content)
    : Draft.convertFromRaw({ blocks: content.blocks, entityMap: {} });
};
