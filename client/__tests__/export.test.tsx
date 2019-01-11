import Export from "../components/export";
import { render } from "react-testing-library";
import { createEditorState } from "./config/createMocks";

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
