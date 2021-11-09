import { EditorState } from "draft-js";
import { DownwriteClient } from "src/data/client";
import type { IAppState } from "src/data/types";
import type { IEntry } from "../../__generated__/client";
import { BaseDraft } from "./base-draft";

export interface IEdit {
  publicStatus: boolean;
  title: string;
  initialFocus: boolean;
  editorState: EditorState | null;
}

export class UpdateEntryState extends BaseDraft {
  #client: DownwriteClient;
  #store: IAppState;
  constructor(_graphql: DownwriteClient, store: IAppState) {
    super();
    this.#client = _graphql;
    this.#store = store;
  }

  async submit(id: string, state: IEdit) {
    if (state.editorState !== null) {
      const content = this.parser.fromEditorState(state.editorState);
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
    const editorState = this.parser.fromMarkdown(entry.content);
    return {
      title: entry.title,
      publicStatus: entry.public,
      editorState,
      initialFocus: false
    };
  }

  async getEntry(id: string) {
    return this.#client.edit(id);
  }
}
