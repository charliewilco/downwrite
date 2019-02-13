import * as React from "react";
import "jest-styled-components";
import "jest-dom/extend-expect";
import Preview, { IEntry } from "../pages/preview";
import Content from "../components/content";
import { render, wait } from "react-testing-library";
import { draftToMarkdown } from "markdown-draft-js";
import { createMockPost } from "../utils/createMocks";
import fetchMock, { FetchMock } from "jest-fetch-mock";
// import MockNextContext from "../utils/mock-next-router";

let title = "Starting Again";
const mockPost = createMockPost({ title, public: true });

let post: IEntry = {
  ...mockPost,
  content: draftToMarkdown(mockPost.content),
  author: {
    username: "Hello",
    gradient: ["...", "..."]
  }
};

let fetch = fetchMock as FetchMock;

jest.mock("next/link", () => {
  return jest.fn(props => <>{props.children}</>);
});

describe("<Preview />", () => {
  it("loads server content", async () => {
    fetch.mockResponse(JSON.stringify(post));
    let FetchContent = render(
      <Preview authed={false} id={mockPost.id} entry={post} />
    );
    await wait(() => FetchContent.getByTestId("PREVIEW_ENTRTY_TITLE"));
    expect(FetchContent.container).toBeTruthy();
    expect(FetchContent.getByTestId("PREVIEW_ENTRTY_TITLE")).toHaveTextContent(
      title
    );
    expect(FetchContent.getByTestId("PREVIEW_ENTRTY_BODY")).toBeInTheDocument();
  });

  it("takes static content", () => {
    let StaticContent = render(<Content {...post} />);
    expect(StaticContent.getByTestId("PREVIEW_ENTRTY_TITLE")).toHaveTextContent(
      title
    );
  });
});
