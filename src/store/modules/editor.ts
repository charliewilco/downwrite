import { EditorState, convertToRaw } from "draft-js";
import type { RawDraftContentState, ContentState } from "draft-js";
import { draftjsToMd } from "draftjs-md-converter";
import { DraftParser } from "@store/modules/parser";
import { DownwriteClient } from "@store/client";
import type { IAppState } from "@store/types";
import { createMarkdown } from "@utils/markdown-template";
import type { IEntry } from "../../__generated__/client";
import { LocalSettings } from "@store/base";

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

const GC_TIMEOUT = 1000 * 60;

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

  export(values: { title: string; date: Date; editorState: EditorState }) {
    let localFileExtension = localStorage.getItem(LocalSettings.EXTENSION) || "";
    let extension = localFileExtension.replace(/\./g, "") || "md";
    let isFileSaverSupported = !!new Blob();

    if (isFileSaverSupported) {
      const cx: ContentState = values.editorState.getCurrentContent();
      const content: RawDraftContentState = convertToRaw(cx);
      let md = createMarkdown(values.title, draftjsToMd(content), values.date);
      let blob = new Blob([md.trim()], { type: "text/markdown; charset=UTF-8" });
      let url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${values.title.replace(/\s+/g, "-").toLowerCase()}.${extension}`;
      const click = new MouseEvent("click");

      requestAnimationFrame(() => {
        a.dispatchEvent(click);
      });

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, GC_TIMEOUT);
    }
  }
}
