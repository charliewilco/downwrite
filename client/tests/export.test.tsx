import * as React from "react";
import "jest-styled-components";
import "jest-dom/extend-expect";
import Export from "../components/export";
import { render } from "react-testing-library";
import { createEditorState } from "../utils/createMocks";

const { container } = render(
  <Export
    title="Testing Patience"
    editorState={createEditorState("Something, Something")}
    date={new Date()}
  />
);

describe("<Export />", () => {
  it("renders", () => {
    expect(container).toBeTruthy();
  });
});
