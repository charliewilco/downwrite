import * as React from "react";
import { render, fireEvent } from "react-testing-library";

import DWEditor from "../components/editor";
import * as Draft from "draft-js";
import { createEditorState } from "./config/createMocks";

const onChange = jest.fn();
const onFocus = jest.fn();
const onSave = jest.fn();

const content = createEditorState("What am i really going to do here?");
const emptyContent = Draft.EditorState.createEmpty();

const mockEditor = (state: Draft.EditorState) =>
  render(
    <DWEditor
      editorCommand="nope"
      onSave={onSave}
      onFocus={onFocus}
      onChange={onChange}
      editorState={state}
    />
  );

class WrappedEditor extends React.Component {
  state = {
    editorState: emptyContent
  };

  onChange = (editorState: Draft.EditorState) => this.setState({ editorState });

  render() {
    return (
      <DWEditor
        editorCommand="nope"
        onSave={onSave}
        onFocus={onFocus}
        editorState={this.state.editorState}
        onChange={this.onChange}
      />
    );
  }
}

describe("<DWEditor />", () => {
  it("Editor mounts", () => {
    const { container } = mockEditor(emptyContent);
    expect(container).toBeTruthy();
  });

  it("Editor mounts with preloaded content", () => {
    const { container } = mockEditor(content);
    expect(container).toBeTruthy();
  });

  it("Editor takes content", () => {
    const { container } = render(<WrappedEditor />);
    fireEvent.keyDown(container);
    // expect(editor.state).toBeTruthy()
  });
});
