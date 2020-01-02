import * as React from "react";
import { LinkProps } from "next/link";
import "@testing-library/jest-dom/extend-expect";

import { render, fireEvent, waitForElement, act } from "@testing-library/react";
import { wait, MockedProvider, MockedResponse } from "@apollo/react-testing";
import { DashboardUI } from "../pages/index";
import { AllPostsDocument } from "../utils/generated";

jest.mock("next/router");

jest.mock("next/link", () => {
  return jest.fn((props: React.PropsWithChildren<LinkProps>) => (
    <>{props.children}</>
  ));
});

function createPage(mocks?: MockedResponse[]) {
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <DashboardUI />
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

const feedMocks: MockedResponse[] = [
  {
    request: {
      query: AllPostsDocument
    },
    result: {
      data: {
        feed: [
          {
            title: "Hooks & TypeScript & Nothing",
            dateAdded: "2019-04-14T07:40:08.591Z",
            id: "3efc9fe8-ab26-4316-9453-889fe444a2a1",
            public: true
          },
          {
            title: "Embracing Type Systems",
            dateAdded: "2019-04-16T05:40:38.076Z",
            id: "4e6f51f8-1446-4955-9eb2-6030ff34f2d3",
            public: true
          },
          {
            title: "Nothing, But Maybe Something",
            dateAdded: "2019-04-17T04:41:45.706Z",
            id: "06e8cf35-a9b6-4e78-886e-a2b7a3102efd",
            public: false
          },
          {
            title: "Trying to Fill a Space",
            dateAdded: "2019-04-17T04:42:21.220Z",
            id: "70471d04-da7a-460e-a1d4-b239fa28701f",
            public: true
          },
          {
            title: "In Defense of Frameworks",
            dateAdded: "2019-04-25T20:52:29.689Z",
            id: "e1114a60-42b3-4a8c-b48f-f5d5af118398",
            public: true
          }
        ]
      }
    }
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
    const ErrorContainer = createPage([]);

    expect(ErrorContainer.getByTestId("LOADING_SPINNER")).toBeInTheDocument();
    await wait(0);

    expect(
      ErrorContainer.getByTestId("INVALID_TOKEN_CONTAINER")
    ).toBeInTheDocument();
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
