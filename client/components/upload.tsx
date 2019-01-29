import * as React from "react";
import fm from "front-matter";
import * as Draft from "draft-js";
import Dropzone from "react-dropzone";
import { markdownToDraft } from "markdown-draft-js";
import { __IS_BROWSER__ } from "../utils/dev";

interface MarkdownConversion {
  title: string;
  editorState: Draft.EditorState;
}

interface IUploadProps {
  onParsed: (o: MarkdownConversion) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

interface IMarkdown {
  body: string;
  attributes: {
    [key: string]: any;
  };
}

export default class Uploader extends React.Component<IUploadProps, {}> {
  public static displayName = "Uploader";

  private reader: FileReader = __IS_BROWSER__ && new FileReader();

  private extractMarkdown = (files: File[]): void => {
    this.reader.onload = () => {
      let md: IMarkdown = fm(this.reader.result as string);

      let markdown = markdownToDraft(md.body, { preserveNewlines: true });

      return this.props.onParsed({
        title: md.attributes.title || "",
        editorState: Draft.EditorState.createWithContent(
          Draft.convertFromRaw(markdown)
        )
      });
    };

    this.reader.readAsText(files[0]);
  };

  private onDrop = (files: File[]) => this.extractMarkdown(files);

  public render(): JSX.Element {
    const { disabled } = this.props;
    return (
      <Dropzone
        accept="text/markdown, text/x-markdown, text/plain"
        multiple={false}
        onDrop={this.onDrop}
        disableClick
        disabled={disabled}>
        {({ getRootProps }) => (
          <div {...getRootProps()} style={{ border: 0, width: "100%" }}>
            {this.props.children}
          </div>
        )}
      </Dropzone>
    );
  }
}
