import * as React from "react";
import * as Draft from "draft-js";
import { draftToMarkdown } from "markdown-draft-js";
import styled from "styled-components";
import FileSaver from "file-saver";
import Markdown from "./export-markdown-button";
import { createMarkdown } from "../utils/markdownTemplate";

interface ExportPr {
  title: string;
  className?: string;
  date: Date;
  editorState: Draft.EditorState;
}

interface ExportCb {
  title: string;
  content: Draft.ContentState;
  date: Date;
}

const ExportContainer = styled.div`
  display: block;
  margin: 0 16px;
`;

const FILE_TYPE = { type: "text/markdown; charset=UTF-8" };

export default class UIMarkdownExport extends React.Component<ExportPr, any> {
  static displayName = "UIMarkdownExport";

  export = (cb: Function) => {
    let { title, date, editorState } = this.props;
    const cx: Draft.ContentState = editorState.getCurrentContent();
    const content = Draft.convertToRaw(cx);

    return cb({
      title,
      content,
      date
    });
  };

  customDraft = (content: Draft.ContentState) =>
    draftToMarkdown(content, {
      entityItems: {
        LINK: {
          open: () => {
            return "[";
          },

          close: entity => {
            return `](${entity.data.url || entity.data.href})`;
          }
        }
      }
    });

  toMarkdown = ({ title, content, date }: ExportCb) => {
    try {
      let isFileSaverSupported: boolean = !!new Blob();
      // TODO: Replicate FileSaver API
      if (isFileSaverSupported) {
        let md = createMarkdown(title, this.customDraft(content), date);
        let blob = new Blob([md.trim()], FILE_TYPE);
        FileSaver.saveAs(blob, `${title.replace(/\s+/g, "-").toLowerCase()}.md`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  onChange = () => this.export(this.toMarkdown);

  render() {
    const { className } = this.props;
    return (
      <ExportContainer
        title="Export entry to a Markdown file."
        className={className}>
        <Markdown onClick={this.onChange} />
      </ExportContainer>
    );
  }
}
