import Preview from "../pages/preview";
import Content from "../components/content";
import { render, wait } from "react-testing-library";
import * as fetchMock from "jest-fetch-mock";

import { draftToMarkdown } from "markdown-draft-js";
import data from "./db.json";

let post = {
  ...data.posts[0],
  content: draftToMarkdown(data.posts[0].content),
  dateAdded: new Date(data.posts[0].dateAdded),
  dateModified: new Date(data.posts[0].dateModified),
  author: {
    username: "Hello",
    gradient: ["...", "..."]
  }
};

jest.mock("next/link", () => {
  return ({ children }) => {
    return children;
  };
});

describe("<Preview />", () => {
  it("loads server content", async () => {
    fetchMock.mockResponse(JSON.stringify(post));
    let FetchContent = render(<Preview entry={post} />);
    await wait(() => FetchContent.getByTestId("PREVIEW_ENTRTY_TITLE"));
    expect(FetchContent.container).toBeTruthy();
    expect(FetchContent.getByTestId("PREVIEW_ENTRTY_TITLE")).toHaveTextContent(
      "Starting again"
    );
    expect(FetchContent.getByTestId("PREVIEW_ENTRTY_BODY")).toBeInTheDOM();
  });

  it("takes static content", () => {
    let StaticContent = render(<Content {...post} />);
    expect(StaticContent.getByTestId("PREVIEW_ENTRTY_TITLE")).toHaveTextContent(
      "Starting again"
    );
  });
});
