import { useCallback, createElement } from "react";
import fm from "front-matter";
import * as Draft from "draft-js";
import { useDropzone } from "react-dropzone";
import { markdownToDraft } from "markdown-draft-js";
import { __IS_BROWSER__ } from "../utils/dev";

interface IMarkdownConversion {
  title: string;
  editorState: Draft.EditorState;
}

interface IUploadProps extends React.PropsWithChildren<{}> {
  onParsed: (o: IMarkdownConversion) => void;
  disabled?: boolean;
}

interface IMarkdown {
  body: string;
  attributes: {
    [key: string]: any;
  };
}

export default function Uploader(props: IUploadProps): JSX.Element {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // NOTE: Maybe use useRef for this?
    const reader: FileReader = __IS_BROWSER__ && new FileReader();

    function extractMarkdown(files: File[]): void {
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
    }

    extractMarkdown(acceptedFiles);
  }, []);

  const { getRootProps } = useDropzone({
    onDrop,
    disabled: props.disabled,
    multiple: false,
    accept: ["text/markdown", "text/x-markdown", "text/plain"]
  });

  return createElement(
    "div",
    {
      ...getRootProps(),
      style: { border: 0, width: "100%" }
    },
    props.children
  );
}
