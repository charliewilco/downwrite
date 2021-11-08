import {
  RawDraftContentState,
  ContentState,
  EditorState,
  convertToRaw
} from "draft-js";
import { useCallback } from "react";

import { draftjsToMd } from "draftjs-md-converter";
import FileSaver from "file-saver";
import { ExportMarkdownButton } from "./export-markdown-button";

import { createMarkdown } from "@utils/markdown-template";
import { LocalSettings } from "@store/base/settings";

interface IExportProps {
  title: string;
  date: Date;
  editorState: EditorState;
}

interface IExportCallback {
  title: string;
  content: RawDraftContentState;
  date: Date;
}

// TODO: use `React.useMemo()` to run export
export function UIMarkdownExport(props: IExportProps) {
  const customDraft = (content: RawDraftContentState): string =>
    draftjsToMd(content);

  const toMarkdown = ({ title, content, date }: IExportCallback): void => {
    let localFileExtension = localStorage.getItem(LocalSettings.EXTENSION) || "";
    let extension = localFileExtension.replace(/\./g, "") || "md";

    try {
      let isFileSaverSupported = !!new Blob();

      if (isFileSaverSupported) {
        let md = createMarkdown(title, customDraft(content), date);
        let blob = new Blob([md.trim()], { type: "text/markdown; charset=UTF-8" });
        FileSaver.saveAs(
          blob,
          `${title.replace(/\s+/g, "-").toLowerCase()}.${extension}`
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const exportMarkdown = useCallback((): void => {
    const { title, date, editorState } = props;
    const cx: ContentState = editorState.getCurrentContent();
    const content: RawDraftContentState = convertToRaw(cx);

    return toMarkdown({
      title,
      content,
      date
    });
  }, [props]);

  return (
    <aside title="Export entry to a Markdown file.">
      <ExportMarkdownButton onClick={exportMarkdown} />
      <style jsx>{`
        aside {
          display: block;
          margin: 0 1rem;
        }
      `}</style>
    </aside>
  );
}
