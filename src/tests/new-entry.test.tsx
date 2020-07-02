import * as React from "react";
import "@testing-library/jest-dom";
import { RecoilRoot } from "recoil";
import preloadAll from "../utils/testing/preload";
import { render } from "@testing-library/react";
import { MockedProvider, MockedResponse } from "@apollo/client/testing";
import NewEditor from "../pages/new";

function createPage(mocks?: MockedResponse[]) {
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <RecoilRoot>
        <NewEditor />
      </RecoilRoot>
    </MockedProvider>
  );
}

beforeAll(async () => {
  await preloadAll();
});

describe("New Editor", () => {
  it("can render new editor", () => {
    const { container } = createPage();

    expect(container.firstChild).toBeInTheDocument();
  });
});
