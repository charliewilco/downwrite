import { convertFromRaw, convertToRaw, EditorState } from "draft-js";
import { mdToDraftjs, draftjsToMd } from "draftjs-md-converter";

import {
  imageLinkDecorators,
  prismHighlightDecorator,
  MultiDecorator
} from "../editor";

const decorators = new MultiDecorator([
  imageLinkDecorators,
  prismHighlightDecorator
]);

export class DraftParser {
  fromMarkdown(content: string): EditorState {
    const rawEditorState = mdToDraftjs(content);
    return EditorState.createWithContent(
      convertFromRaw({
        blocks: [...rawEditorState.blocks],
        entityMap: {}
      }),
      decorators
    );
  }

  fromEditorState(editorState: EditorState) {
    const raw = convertToRaw(editorState.getCurrentContent());
    const content = draftjsToMd(raw);

    return content;
  }
}
