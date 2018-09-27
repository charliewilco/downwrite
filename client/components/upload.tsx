import * as React from 'react';
import fm from 'front-matter';
import * as Draft from 'draft-js';
import Dropzone from 'react-dropzone';
import { markdownToDraft } from 'markdown-draft-js';
import { __IS_BROWSER__ } from '../utils/dev';

interface MarkdownConversion {
  title: string;
  editorState: Draft.EditorState;
}

interface IUploadProps {
  upload: (o: MarkdownConversion) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

interface IMarkdown {
  body: string;
  attributes: {
    [key: string]: any;
  };
}

export default class Uploader extends React.Component<IUploadProps, any> {
  static displayName = 'Uploader';

  reader: FileReader = __IS_BROWSER__ && new FileReader();

  extractMarkdown = files => {
    this.reader.onload = () => {
      let md: IMarkdown = fm(this.reader.result as string);

      let markdown = markdownToDraft(md.body, { preserveNewlines: true });

      return this.props.upload({
        title: md.attributes.title || '',
        editorState: Draft.EditorState.createWithContent(
          Draft.convertFromRaw(markdown)
        )
      });
    };

    this.reader.readAsText(files[0]);
  };

  onDrop = files => this.extractMarkdown(files);

  render() {
    const { disabled, children } = this.props;
    return (
      <Dropzone
        accept="text/markdown, text/x-markdown, text/plain"
        multiple={false}
        style={{ border: 0, width: '100%' }}
        onDrop={this.onDrop}
        disableClick
        disabled={disabled}>
        {children}
      </Dropzone>
    );
  }
}
