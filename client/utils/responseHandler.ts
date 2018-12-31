import * as Draft from "draft-js";
import { __IS_BROWSER__ } from "./dev";

export const superConverter: Function = (content: Draft.RawDraftContentState) => {
  return content.hasOwnProperty("entityMap")
    ? Draft.convertFromRaw(content)
    : Draft.convertFromRaw({ blocks: content.blocks, entityMap: {} });
};
