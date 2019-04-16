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

// TODO: use `React.useMemo()` on upload
export default function Uploader(props: IUploadProps): JSX.Element {
  const reader: FileReader = __IS_BROWSER__ && new FileReader();

  const onDrop = (files: File[]) => extractMarkdown(files);

  const extractMarkdown = (files: File[]): void => {
    reader.onload = () => {
      let md: IMarkdown = fm(reader.result as string);

      let markdown = markdownToDraft(md.body, { preserveNewlines: true });

      return props.onParsed({
        title: md.attributes.title || "",
        editorState: Draft.EditorState.createWithContent(
          Draft.convertFromRaw(markdown)
        )
      });
    };

    reader.readAsText(files[0]);
  };

  return (
    <Dropzone
      accept="text/markdown, text/x-markdown, text/plain"
      multiple={false}
      onDrop={onDrop}
      disableClick
      disabled={props.disabled}>
      {({ getRootProps }) => (
        <div {...getRootProps()} style={{ border: 0, width: "100%" }}>
          {props.children}
        </div>
      )}
    </Dropzone>
  );
}
