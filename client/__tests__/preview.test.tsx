import Preview, { IEntry } from "../pages/preview";
import Content from "../components/content";
import { render, wait } from "react-testing-library";
import * as fetchMock from "jest-fetch-mock";
import { draftToMarkdown } from "markdown-draft-js";
import { createMockPost } from "./config/createMocks";

const mockPost = createMockPost({ title: "Starting Again", public: true });

let post: IEntry = {
  ...mockPost,
  content: draftToMarkdown(mockPost.content),
  author: {
    username: "Hello",
    gradient: ["...", "..."]
  }
};

jest.mock("next/link", () => {
  return ({ children }: { children: React.ReactNode }) => {
    return children;
  };
});

describe("<Preview />", () => {
  it("loads server content", async () => {
    fetchMock.mockResponse(JSON.stringify(post));
    let FetchContent = render(
      <Preview authed={false} id={mockPost.id} entry={post} />
    );
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
