import * as React from "react";
import "@testing-library/jest-dom/extend-expect";
import { LinkProps } from "next/link";

import { render, wait, fireEvent } from "@testing-library/react";
import Dashboard from "../pages/index";
import fetchMock, { FetchMock } from "jest-fetch-mock";
import { createMockPosts } from "../utils/createMocks";

const entries = createMockPosts(4);
jest.mock("next/router");

jest.mock("next/link", () => {
  return jest.fn((props: LinkProps) => <>{props.children}</>);
});
const PostDashboard = () => {
  return <Dashboard entries={entries} />;
};

let fetch = fetchMock as FetchMock;

// NOTE: test broken by upgrading @testing-library
xdescribe("<Dashboard /> post lists", () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  it("shows list of Cards if authed and has posts", async () => {
    fetch.mockResponseOnce(JSON.stringify(entries));
    const FullDashboard = render(<PostDashboard />);
    await wait(() => FullDashboard.getByTestId("CARD"));

    expect(FullDashboard.container).toBeTruthy();
    expect(FullDashboard.getByTestId("CARD")).toHaveTextContent("Mocked Posts");
  });

  it("can toggle from grid to list", async () => {
    fetch.mockResponseOnce(JSON.stringify(entries));
    const FullDashboard = render(<PostDashboard />);
    await wait(() => FullDashboard.getByTestId("CARD"));

    expect(FullDashboard.getByTestId("ENTRIES_GRIDVIEW")).toBeInTheDocument();
    expect(
      FullDashboard.container.querySelector("[data-testid='ENTRIES_LISTVIEW']")
    ).not.toBeInTheDocument();

    fireEvent.click(FullDashboard.getByTestId("LAYOUT_CONTROL_LIST"));
    await wait(() => FullDashboard.getByTestId("POST_LIST_ITEM"));

    expect(FullDashboard.getByTestId("ENTRIES_LISTVIEW")).toBeInTheDocument();
  });

  xit("shows error if error", async () => {
    fetch.mockResponseOnce(JSON.stringify([]));
    const ErrorContainer = render(<Dashboard entries={[]} />);
    await wait(() => ErrorContainer.getByTestId("LOADING_SPINNER"));

    expect(
      ErrorContainer.getByTestId("INVALID_TOKEN_CONTAINER")
    ).toBeInTheDocument();

    expect(
      ErrorContainer.container.querySelector("[data-testid='NO_ENTRIES_PROMPT']")
    ).toBeInTheDocument();
  });

  xit("shows prompt to write more if no posts", async () => {});
  xit("can prompt to delete", async () => {});
});
