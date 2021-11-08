import { EditorState } from "draft-js";
import { DraftParser } from "@store/modules/parser";
import { DownwriteClient } from "@store/client";
import type { IAppState } from "@store/types";
import type { IEntry } from "../../__generated__/client";

export interface IEdit {
  publicStatus: boolean;
  title: string;
  initialFocus: boolean;
  editorState: EditorState | null;
}

export const initialEditState: IEdit = {
  publicStatus: false,
  title: "",
  initialFocus: false,
  editorState: null
};

export class EditorAction {
  #parser = new DraftParser();
  #client: DownwriteClient;
  #store: IAppState;
  constructor(_graphql: DownwriteClient, store: IAppState) {
    this.#client = _graphql;
    this.#store = store;
  }

  async submit(id: string, state: IEdit) {
    if (state.editorState !== null) {
      const content = this.#parser.fromEditorState(state.editorState);
      try {
        const value = await this.#client.updateEntry({
          id,
          content,
          title: state.title,
          status: state.publicStatus
        });
        return value;
      } catch (err) {
        this.#store.notifications.error(err.message);
      }
    }
  }

  load(entry: Pick<IEntry, "title" | "dateAdded" | "content" | "public">): IEdit {
    return {
      title: entry.title,
      publicStatus: entry.public,
      editorState: this.#parser.fromMarkdown(entry.content),
      initialFocus: false
    };
  }

  async getEntry(id: string) {
    return this.#client.edit(id);
  }
}
