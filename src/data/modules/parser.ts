import { convertFromRaw, convertToRaw, EditorState } from "draft-js";
import { mdToDraftjs, draftjsToMd } from "draftjs-md-converter";
import format from "date-fns/format";

import { imageLinkDecorators, MultiDecorator } from "../../editor";

const decorators = new MultiDecorator([
  imageLinkDecorators
  // prismHighlightDecorator
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

  createMarkdown(title: string, content: string, date?: Date): string {
    return `
      ---
      title: ${title}
      ${date && `dateAdded: ${format(new Date(date), "dd MMMM yyyy")}`}
      ---
      
      ${content}
      `;
  }
}
