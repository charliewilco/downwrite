import * as React from "react";
import { render, fireEvent } from "react-testing-library";

import DWEditor from "../components/editor";
import * as Draft from "draft-js";
import data from "./db.json";

const content = Draft.convertFromRaw(data.posts[0]
  .content as Draft.RawDraftContentState);
const emptyContent = Draft.EditorState.createEmpty();
const preloadedContent = Draft.EditorState.createWithContent(content);
const mockEditor = state =>
  render(<DWEditor onChange={jest.fn()} editorState={state} />);

class WrappedEditor extends React.Component {
  state = {
    editorState: emptyContent
  };

  onChange = editorState => this.setState({ editorState });

  render() {
    return (
      <DWEditor editorState={this.state.editorState} onChange={this.onChange} />
    );
  }
}

describe("<DWEditor />", () => {
  it("Editor mounts", () => {
    const { container } = mockEditor(emptyContent);
    expect(container).toBeTruthy();
  });

  it("Editor mounts with preloaded content", () => {
    const { container } = mockEditor(preloadedContent);
    expect(container).toBeTruthy();
  });

  it("Editor takes content", () => {
    const { container } = render(<WrappedEditor />);
    fireEvent.keyDown(container);
    // expect(editor.state).toBeTruthy()
  });
});
