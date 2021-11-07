import { makeAutoObservable } from "mobx";
import { ContentState, EditorState, convertToRaw } from "draft-js";
import { draftjsToMd } from "draftjs-md-converter";
import { DownwriteClient } from "@store/client";
import { IAppState } from "./store";
import {
  emptyContentState,
  MultiDecorator,
  imageLinkDecorators,
  prismHighlightDecorator
} from "../editor";

export interface INewEditorValues {
  title: string;
}

const decorators = new MultiDecorator([
  imageLinkDecorators,
  prismHighlightDecorator
]);

export class CreateEntry {
  title = "";
  editorState = EditorState.createWithContent(emptyContentState, decorators);
  #client: DownwriteClient;
  #store: IAppState;
  constructor(_graphql: DownwriteClient, store: IAppState) {
    makeAutoObservable(this);
    this.#client = _graphql;
    this.#store = store;
  }

  async create(title: string) {
    const ContentState: ContentState = this.editorState.getCurrentContent();
    const state = convertToRaw(ContentState);
    const content = draftjsToMd(state);

    try {
      return this.#client.createEntry({ content, title });
    } catch (error) {
      this.#store.notifications.error(error.message);
    }
  }

  mutateEditorState(editorState: EditorState) {
    this.editorState = editorState;
  }

  getEditorState() {
    return this.editorState;
  }
}
