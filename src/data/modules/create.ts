import { EditorState } from "draft-js";
import { BaseDraft } from "./base-draft";
import { APIClient } from "@data/client";
import type { IAppState } from "@data/types";
import { __IS_BROWSER__ } from "@shared/constants";

export interface INewEditorValues {
  title: string;
}

interface ICreateEntryState {
  title: string;
  editorState: EditorState;
}

export class CreateEntryState extends BaseDraft {
  #client: APIClient;
  #store: IAppState;
  constructor(_graphql: APIClient, store: IAppState) {
    super();
    this.#client = _graphql;
    this.#store = store;
  }

  async create({ editorState, title }: ICreateEntryState) {
    const content = this.parser.fromEditorState(editorState);
    try {
      return this.#client.createEntry({ content, title });
    } catch (error) {
      this.#store.notifications.error(error.message);
    }
  }

  onDrop(acceptedFiles: File[]) {
    return this.importFiles(acceptedFiles);
  }
}
