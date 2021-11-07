import {
  RawDraftContentState,
  ContentState,
  EditorState,
  convertToRaw
} from "draft-js";
import { draftjsToMd } from "draftjs-md-converter";
import FileSaver from "file-saver";
import Markdown from "./export-markdown-button";
import { createMarkdown } from "../utils/markdown-template";
import classNames from "../utils/classnames";
import { LocalSettings } from "./settings-markdown";
import { useCallback } from "react";

interface IExportProps {
  title: string;
  className?: string;
  date: Date;
  editorState: EditorState;
}

interface IExportCallback {
  title: string;
  content: RawDraftContentState;
  date: Date;
}

// TODO: use `React.useMemo()` to run export
export default function UIMarkdownExport(props: IExportProps) {
  const className = classNames("block mx-4 my-0", props.className);
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
    <aside title="Export entry to a Markdown file." className={className}>
      <Markdown onClick={exportMarkdown} />
    </aside>
  );
}
