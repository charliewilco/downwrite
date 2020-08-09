import * as React from "react";
import * as Draft from "draft-js";
import { draftToMarkdown } from "markdown-draft-js";
import FileSaver from "file-saver";
import Markdown from "./export-markdown-button";
import { createMarkdown } from "../utils/markdownTemplate";
import classNames from "../utils/classnames";
import { LocalSettings } from "./settings-markdown";

interface IExportProps {
  title: string;
  className?: string;
  date: Date;
  editorState: Draft.EditorState;
}

interface IExportCallback {
  title: string;
  content: Draft.RawDraftContentState;
  date: Date;
}

// TODO: use `React.useMemo()` to run export
export default function UIMarkdownExport(props: IExportProps) {
  const className = classNames("Export", props.className);

  const exportMarkdown = (): void => {
    const { title, date, editorState } = props;
    const cx: Draft.ContentState = editorState.getCurrentContent();
    const content: Draft.RawDraftContentState = Draft.convertToRaw(cx);

    return toMarkdown({
      title,
      content,
      date
    });
  };

  const customDraft = (content: Draft.RawDraftContentState): string =>
    draftToMarkdown(content, {
      entityItems: {
        LINK: {
          open: () => {
            return "[";
          },

          close: (entity: any) => {
            return `](${entity.data.url || entity.data.href})`;
          }
        }
      }
    });

  const toMarkdown = ({ title, content, date }: IExportCallback): void => {
    let localFileExtension = localStorage.getItem(LocalSettings.EXTENSION);
    let extension = localFileExtension.replace(/\./g, "") || "md";

    try {
      let isFileSaverSupported: boolean = !!new Blob();

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

  return (
    <aside title="Export entry to a Markdown file." className={className}>
      <Markdown onClick={exportMarkdown} />
    </aside>
  );
}
