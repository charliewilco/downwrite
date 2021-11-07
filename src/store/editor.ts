import { EditorState } from "draft-js";
import { makeAutoObservable } from "mobx";
import { DraftParser } from "@store/parser";
import { DownwriteClient } from "@store/client";
import { IAppState } from "./store";

import { IEntry } from "../__generated__/client";

export interface IEditorState {
  publicStatus: boolean;
  title: string;
  initialFocus: boolean;
}

export class EditorAction implements IEditorState {
  title = "";
  publicStatus = false;
  initialFocus = false;
  editorState: EditorState | null = null;
  #parser = new DraftParser();
  #client: DownwriteClient;
  #store: IAppState;
  constructor(_graphql: DownwriteClient, store: IAppState) {
    makeAutoObservable(this);
    this.#client = _graphql;
    this.#store = store;
  }

  mutateEditorState(editorState: EditorState) {
    this.editorState = editorState;
  }

  getEditorState() {
    return this.editorState;
  }

  initialize(entry?: Pick<IEntry, "title" | "dateAdded" | "content" | "public">) {
    this.#_initializer(entry);
  }

  #_initializer(
    entry?: Pick<IEntry, "title" | "dateAdded" | "content" | "public"> | null
  ) {
    if (!!entry !== null) {
      this.title = entry.title || "";
      this.publicStatus = !!entry.public;
      this.initialFocus = false;
    } else {
      this.initialFocus = false;
      this.title = "";
      this.publicStatus = false;
    }
  }

  setFocus() {
    this.initialFocus = true;
  }

  toggleStatus() {
    this.publicStatus = !this.publicStatus;
  }

  updateTitle(value: string) {
    this.title = value;
  }

  async submit(id: string) {
    if (this.editorState !== null) {
      const content = this.#parser.fromEditorState(this.editorState);
      try {
        const value = await this.#client.updateEntry({
          id,
          content,
          title: this.title,
          status: this.publicStatus
        });
        return value;
      } catch (err) {
        this.#store.notifications.error(err.message);
      }
    }
  }

  load(entry: Pick<IEntry, "title" | "dateAdded" | "content" | "public">) {
    this.editorState = this.#parser.fromMarkdown(entry.content);
  }

  async getEntry(id: string) {
    return this.#client.edit(id);
  }
}
