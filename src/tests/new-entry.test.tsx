import * as React from "react";
import "@testing-library/jest-dom/extend-expect";

import { render, fireEvent, waitForElement, act } from "@testing-library/react";
import { wait, MockedProvider, MockedResponse } from "@apollo/react-testing";
import { NewEditor } from "../pages/new";

jest.mock("next/router");

function createPage(mocks?: MockedResponse[]) {
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <NewEditor />
    </MockedProvider>
  );
}

describe("New Editor", () => {
  it("can render new editor", () => {
    const { container, debug } = createPage();
    debug();
    expect(container.firstChild).toBeInTheDOM();
  });
});
