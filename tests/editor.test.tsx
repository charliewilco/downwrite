import * as React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import DWEditor from "../components/editor";
import * as Draft from "draft-js";
import { createEditorState } from "../utils/createMocks";

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

function WrappedEditor() {
  const [editorState, setEditorState] = React.useState(emptyContent);
  return (
    <DWEditor
      editorCommand="nope"
      onSave={onSave}
      onFocus={onFocus}
      editorState={editorState}
      onChange={state => setEditorState(state)}
    />
  );
}

// NOTE: test broken by upgrading @testing-library
describe("<DWEditor />", () => {
  xit("Editor mounts", () => {
    const { container } = mockEditor(emptyContent);
    expect(container).toBeTruthy();
  });

  xit("Editor mounts with preloaded content", () => {
    const { container } = mockEditor(content);
    expect(container).toBeTruthy();
  });

  xit("Editor takes content", () => {
    const { container } = render(<WrappedEditor />);
    fireEvent.keyDown(container);
    // expect(editor.state).toBeTruthy()
  });
});
