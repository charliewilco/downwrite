import * as React from "react";
import * as Draft from "draft-js";
import { draftToMarkdown } from "markdown-draft-js";
import styled from "styled-components";
import FileSaver from "file-saver";
import Markdown from "./export-markdown-button";
import { createMarkdown } from "../utils/markdownTemplate";

interface ExportProps {
  title: string;
  className?: string;
  date: Date;
  editorState: Draft.EditorState;
}

interface ExportCallback {
  title: string;
  content: Draft.RawDraftContentState;
  date: Date;
}

const ExportContainer = styled.div`
  display: block;
  margin: 0 16px;
`;

// TODO: use `React.useMemo()` to run export
const UIMarkdownExport: React.FC<ExportProps> = function(props) {
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

  const toMarkdown = ({ title, content, date }: ExportCallback): void => {
    let localFileExtension = localStorage.getItem("DW_FILE_EXTENSION");
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
    <ExportContainer
      title="Export entry to a Markdown file."
      className={props.className}>
      <Markdown onClick={exportMarkdown} />
    </ExportContainer>
  );
};

export default UIMarkdownExport;
