import { RawDraftContentState } from "draft-js";
import { v4 as uuid } from "uuid";

export const fixRawContentState = (raw: RawDraftContentState) => {
  let keyCache: Record<string, string> = {};

  const clone = Object.assign({}, raw);

  clone.blocks = raw.blocks.map((n) => {
    let key = !!keyCache[n.key] ? n.key : uuid();
    return {
      ...n,
      key
    };
  });

  return clone;
};
