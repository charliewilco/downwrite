import * as React from "react";
import "@testing-library/jest-dom/extend-expect";
import { LinkProps } from "next/link";

import { render, wait, fireEvent } from "@testing-library/react";
import Dashboard from "../pages/index";
import ApolloClient from "apollo-client";

jest.mock("next/router");

jest.mock("next/link", () => {
  return jest.fn((props: React.PropsWithChildren<LinkProps>) => (
    <>{props.children}</>
  ));
});

const PostDashboard = () => {
  return <Dashboard apolloClient={{} as ApolloClient<{}>} />;
};

// NOTE: test broken by upgrading @testing-library
xdescribe("<Dashboard /> post lists", () => {
  it("shows list of Cards if authed and has posts", async () => {
    const FullDashboard = render(<PostDashboard />);
    await wait(() => FullDashboard.getByTestId("CARD"));

    expect(FullDashboard.container).toBeTruthy();
    expect(FullDashboard.getByTestId("CARD")).toHaveTextContent("Mocked Posts");
  });

  it("can toggle from grid to list", async () => {
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
    const ErrorContainer = render(
      <Dashboard apolloClient={{} as ApolloClient<{}>} />
    );
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
