import * as React from "react";
import "@testing-library/jest-dom";

import { render } from "@testing-library/react";
import { MockedProvider, MockedResponse } from "@apollo/react-testing";
import NewEditor from "../pages/new";
import Loading from "../components/loading";
import { MemoryRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

function createPage(mocks?: MockedResponse[]) {
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <MemoryRouter>
        <HelmetProvider>
          <React.Suspense fallback={<Loading size={50} />}>
            <NewEditor />
          </React.Suspense>
        </HelmetProvider>
      </MemoryRouter>
    </MockedProvider>
  );
}

describe("New Editor", () => {
  it("can render new editor", () => {
    const { container } = createPage();

    expect(container.firstChild).toBeInTheDocument();
  });
});
