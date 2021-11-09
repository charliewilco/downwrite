import {
  convertFromRaw,
  convertToRaw,
  EditorState,
  RawDraftContentState
} from "draft-js";
import { fixRawContentState } from "../../editor/raw";

const fixture: RawDraftContentState = {
  entityMap: {},
  blocks: [
    {
      depth: 0,
      type: "unstyled",
      text: "That song about rainbows from the Rolling Stones, she comes in colors everywhere",
      key: "...",
      entityRanges: [],
      inlineStyleRanges: []
    },
    {
      type: "unstyled",
      text: "",
      key: "...",
      entityRanges: [],
      inlineStyleRanges: [],
      depth: 0
    },
    {
      depth: 0,
      type: "unstyled",
      text: "A whole line of content",
      key: "...",
      entityRanges: [],
      inlineStyleRanges: []
    },
    {
      type: "unstyled",
      text: "",
      key: "...",
      entityRanges: [],
      inlineStyleRanges: [],
      depth: 0
    },
    {
      depth: 0,
      type: "unstyled",
      text: "Does someone need another red bull?",
      key: "...",
      entityRanges: [],
      inlineStyleRanges: []
    }
  ]
};

describe("Editor Utils", () => {
  it("Fix for raw content bug", () => {
    const fixed = fixRawContentState(fixture);

    expect(fixture.blocks.length).not.toEqual(
      convertToRaw(
        EditorState.createWithContent(convertFromRaw(fixture)).getCurrentContent()
      ).blocks.length
    );
    expect(new Set<string>(fixed.blocks.map((b) => b.key)).size).toEqual(
      fixture.blocks.length
    );

    expect(fixture.blocks.length).toEqual(
      convertToRaw(
        EditorState.createWithContent(convertFromRaw(fixed)).getCurrentContent()
      ).blocks.length
    );
  });
});
