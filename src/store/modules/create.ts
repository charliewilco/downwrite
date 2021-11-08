import { EditorState } from "draft-js";
import { DownwriteClient } from "@store/client";
import type { IAppState } from "@store/types";
import { __IS_BROWSER__ } from "@utils/dev";
import { BaseDraft } from "./base-draft";

export interface INewEditorValues {
  title: string;
}

interface ICreateEntryState {
  title: string;
  editorState: EditorState;
}

export class CreateEntryState extends BaseDraft {
  #client: DownwriteClient;
  #store: IAppState;
  constructor(_graphql: DownwriteClient, store: IAppState) {
    super();
    this.#client = _graphql;
    this.#store = store;
  }

  async create(state: ICreateEntryState) {
    const content = this.parser.fromEditorState(state.editorState);
    try {
      return this.#client.createEntry({ content, title: state.title });
    } catch (error) {
      this.#store.notifications.error(error.message);
    }
  }

  onDrop(acceptedFiles: File[]) {
    return this.import(acceptedFiles);
  }
}
