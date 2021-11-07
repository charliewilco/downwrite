import { useRef, useCallback } from "react";
import { EditorState, convertFromRaw } from "draft-js";
import { useDropzone } from "react-dropzone";
import { mdToDraftjs } from "draftjs-md-converter";
import { fm } from "@utils/fm";
import { __IS_BROWSER__ } from "@utils/dev";

export interface IMarkdownConversion {
  title: string;
  editorState: EditorState;
}

interface IUploadProps {
  onParsed: (o: IMarkdownConversion) => void;
  disabled?: boolean;
}

interface IMarkdown {
  body: string;
  attributes: {
    [key: string]: any;
  };
}

function useFileReader() {
  return useRef<FileReader>(__IS_BROWSER__ ? new FileReader() : null);
}

type DropCallback = (files: File[]) => void;

const Uploader: React.FC<IUploadProps> = (props) => {
  const reader = useFileReader();
  const onDrop = useCallback<DropCallback>(
    (acceptedFiles: File[]) => {
      function extractMarkdown(files: File[]): void {
        if (reader.current !== null) {
          reader.current.onload = () => {
            const md: IMarkdown = fm(reader.current!.result as string);
            const markdown = mdToDraftjs(md.body);

            return props.onParsed({
              title: md.attributes.title || "",
              editorState: EditorState.createWithContent(convertFromRaw(markdown))
            });
          };

          reader.current.readAsText(files[0]);
        }
      }

      extractMarkdown(acceptedFiles);
    },
    [props, reader]
  );

  const { getRootProps } = useDropzone({
    onDrop,
    disabled: props.disabled,
    multiple: false,
    accept: ["text/markdown", "text/x-markdown", "text/plain"]
  });

  return (
    <div {...getRootProps()} className="border-0 w-full">
      {props.children}
    </div>
  );
};

export default Uploader;
