import * as Draft from "draft-js";
import { __IS_BROWSER__ } from "./dev";

export const superConverter: Function = (
  content: Draft.RawDraftContentState
): Draft.ContentState => {
  content = typeof content === "string" ? JSON.parse(content) : content;

  return content.hasOwnProperty("entityMap")
    ? Draft.convertFromRaw(content)
    : Draft.convertFromRaw({ blocks: content.blocks, entityMap: {} });
};
