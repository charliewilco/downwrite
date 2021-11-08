import { ContentState, EditorState, convertFromRaw, convertToRaw } from "draft-js";
import { draftjsToMd, mdToDraftjs } from "draftjs-md-converter";
import { DownwriteClient } from "@store/client";
import type { IAppState } from "@store/types";
import { __IS_BROWSER__ } from "@utils/dev";
import { fmParserr } from "@utils/fm";

export interface INewEditorValues {
  title: string;
}

interface ICreateEntryState {
  title: string;
  editorState: EditorState;
}

interface IMarkdown {
  body: string;
  attributes: {
    [key: string]: any;
  };
}

export class CreateEntry {
  #client: DownwriteClient;
  #store: IAppState;
  #reader: FileReader = null;
  constructor(_graphql: DownwriteClient, store: IAppState) {
    this.#client = _graphql;
    this.#store = store;

    if (__IS_BROWSER__) {
      this.#reader = new FileReader();
    }
  }

  async create(state: ICreateEntryState) {
    const ContentState: ContentState = state.editorState.getCurrentContent();
    const contentState = convertToRaw(ContentState);
    const content = draftjsToMd(contentState);

    try {
      return this.#client.createEntry({ content, title: state.title });
    } catch (error) {
      this.#store.notifications.error(error.message);
    }
  }

  async extractMarkdown(files: File[]) {
    return new Promise<{
      title: string;
      editorState: EditorState;
    }>((resolve, reject) => {
      if (this.#reader !== null) {
        this.#reader.onload = () => {
          const md: IMarkdown = fmParserr(this.#reader!.result as string);
          const markdown = mdToDraftjs(md.body);

          resolve({
            title: md.attributes.title || "",
            editorState: EditorState.createWithContent(convertFromRaw(markdown))
          });
        };

        this.#reader.readAsText(files[0]);
      }

      this.#reader.onerror = () => reject(this.#reader.error);
    });
  }

  onDrop(acceptedFiles: File[]) {
    return this.extractMarkdown(acceptedFiles);
  }
}
