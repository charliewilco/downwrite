import * as React from "react";
import "@testing-library/jest-dom";

import { render, fireEvent, waitForElement, act } from "@testing-library/react";
import { wait, MockedProvider, MockedResponse } from "@apollo/react-testing";
import DashboardUI from "../pages/dashboard";
import { UIShell } from "../components/ui-shell";
import { AllPostsDocument } from "../utils/generated";
import { data } from "./fixtures/feed.json";
import { MockAuthProvider } from "../utils/testing";

function createPage(mocks?: MockedResponse[], authed: boolean = true) {
  return render(
    <MockedProvider mocks={mocks}>
      <MockAuthProvider authed={authed}>
        <UIShell>
          <DashboardUI />
        </UIShell>
      </MockAuthProvider>
    </MockedProvider>
  );
}

const emptyFeedMocks: MockedResponse[] = [
  {
    request: {
      query: AllPostsDocument
    },
    result: {
      data: {
        feed: []
      }
    }
  }
];

const errorMock: MockedResponse[] = [
  {
    request: { query: AllPostsDocument },
    error: new Error("...")
  }
];

const feedMocks: MockedResponse[] = [
  {
    request: {
      query: AllPostsDocument
    },
    result: { data }
  }
];

describe("<Dashboard /> post lists", () => {
  it("shows list of Cards if authed and has posts", async () => {
    const FullDashboard = createPage(feedMocks);
    await wait(0);

    const cards = await waitForElement(() => FullDashboard.queryAllByTestId("CARD"));

    expect(FullDashboard.container).toBeTruthy();
    expect(cards).toHaveLength(5);
  });

  it("can toggle from grid to list", async () => {
    const FullDashboard = createPage(feedMocks);
    await wait(0);

    const cards = await waitForElement(() => FullDashboard.queryAllByTestId("CARD"));

    expect(FullDashboard.getByTestId("ENTRIES_GRIDVIEW")).toBeInTheDocument();
    expect(
      FullDashboard.container.querySelector("[data-testid='ENTRIES_LISTVIEW']")
    ).not.toBeInTheDocument();

    act(() => {
      fireEvent.click(FullDashboard.getByTestId("LAYOUT_CONTROL_LIST"));
    });
    const items = await waitForElement(() =>
      FullDashboard.queryAllByTestId("POST_LIST_ITEM")
    );
    expect(items).toHaveLength(5);
    expect(cards).toHaveLength(5);

    expect(FullDashboard.getByTestId("ENTRIES_LISTVIEW")).toBeInTheDocument();
  });

  it("shows error if error", async () => {
    const ErrorContainer = createPage(errorMock, false);

    await wait(0);

    const errorDiv = await waitForElement(() =>
      ErrorContainer.getByTestId("INVALID_TOKEN_CONTAINER")
    );

    expect(errorDiv).toBeInTheDocument();
  });

  it("shows prompt to write more if no posts", async () => {
    const NoPrompt = createPage(emptyFeedMocks);

    const message = await waitForElement(() =>
      NoPrompt.getByTestId("NO_ENTRIES_PROMPT")
    );
    expect(message).toBeInTheDocument();
  });
  xit("can prompt to delete", async () => {});
});
