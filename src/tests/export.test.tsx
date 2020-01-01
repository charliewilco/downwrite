import * as React from "react";
import "@testing-library/jest-dom/extend-expect";
import Export from "../components/export";
import { render } from "@testing-library/react";
import { createEditorState } from "../utils/testing";

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
