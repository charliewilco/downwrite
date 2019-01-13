import * as React from "react";
import "jest-styled-components";
import "jest-dom/extend-expect";
import Preview, { IEntry } from "../pages/preview";
import Content from "../components/content";
import { render, wait } from "react-testing-library";
import { draftToMarkdown } from "markdown-draft-js";
import { createMockPost } from "../utils/createMocks";
import fetchMock from "jest-fetch-mock";
import MockNextContext from "../utils/mock-next-router";

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

describe("<Preview />", () => {
  it("loads server content", async () => {
    fetchMock.mockResponse(JSON.stringify(post));
    let FetchContent = render(
      <MockNextContext>
        <Preview authed={false} id={mockPost.id} entry={post} />
      </MockNextContext>
    );
    await wait(() => FetchContent.getByTestId("PREVIEW_ENTRTY_TITLE"));
    expect(FetchContent.container).toBeTruthy();
    expect(FetchContent.getByTestId("PREVIEW_ENTRTY_TITLE")).toHaveTextContent(
      title
    );
    expect(FetchContent.getByTestId("PREVIEW_ENTRTY_BODY")).toBeInTheDocument();
  });

  it("takes static content", () => {
    let StaticContent = render(
      <MockNextContext>
        <Content {...post} />
      </MockNextContext>
    );
    expect(StaticContent.getByTestId("PREVIEW_ENTRTY_TITLE")).toHaveTextContent(
      title
    );
  });
});
