import * as React from "react";
import "@testing-library/jest-dom";

import { render } from "@testing-library/react";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import NewEditor from "../pages/new";

function createPage(mocks?: MockedResponse[]) {
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <NewEditor />
    </MockedProvider>
  );
}

describe("New Editor", () => {
  it("can render new editor", () => {
    const { container } = createPage();

    expect(container.firstChild).toBeInTheDocument();
  });
});
