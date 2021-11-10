import { EditorState, convertFromRaw, convertToRaw } from "draft-js";
import type { RawDraftContentState, ContentState } from "draft-js";

import { draftjsToMd, mdToDraftjs } from "draftjs-md-converter";
import { DraftParser } from "./parser";
import { LocalSettings } from "@data/base";
import { __IS_BROWSER__ } from "@shared/constants";
import { fmParserr } from "@shared/fm";

interface IMarkdown {
  body: string;
  attributes: {
    [key: string]: any;
  };
}

const GC_TIMEOUT = 1000 * 60;

export abstract class BaseDraft {
  #reader: FileReader = null;
  parser = new DraftParser();

  async import(files: File[]) {
    return new Promise<{
      title: string;
      editorState: EditorState;
    }>((resolve, reject) => {
      if (this.#reader === null) {
        this.#reader = new FileReader();
      }

      this.#reader.onload = () => {
        const md: IMarkdown = fmParserr(this.#reader!.result as string);
        const markdown = mdToDraftjs(md.body);

        resolve({
          title: md.attributes.title || "",
          editorState: EditorState.createWithContent(convertFromRaw(markdown))
        });
      };

      this.#reader.readAsText(files[0]);

      this.#reader.onerror = () => reject(this.#reader.error);
    });
  }

  export(values: { title: string; date: Date; editorState: EditorState }) {
    let localFileExtension = localStorage.getItem(LocalSettings.EXTENSION) || "";
    let extension = localFileExtension.replace(/\./g, "") || "md";
    let isFileSaverSupported = !!new Blob();

    if (isFileSaverSupported) {
      const cx: ContentState = values.editorState.getCurrentContent();
      const content: RawDraftContentState = convertToRaw(cx);
      let md = this.parser.createMarkdown(
        values.title,
        draftjsToMd(content),
        values.date
      );
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
