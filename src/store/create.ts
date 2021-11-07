import { ContentState, EditorState, convertToRaw } from "draft-js";
import { draftjsToMd } from "draftjs-md-converter";
import { DownwriteClient } from "@store/client";
import { IAppState } from "./store";

export interface INewEditorValues {
  title: string;
}

interface ICreateEntryState {
  title: string;
  editorState: EditorState;
}

export class CreateEntry {
  #client: DownwriteClient;
  #store: IAppState;
  constructor(_graphql: DownwriteClient, store: IAppState) {
    this.#client = _graphql;
    this.#store = store;
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
}
