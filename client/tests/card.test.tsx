import * as React from "react";
import "jest-dom/extend-expect";
import { LinkProps } from "next/link";
import { fireEvent, render } from "react-testing-library";
import Card from "../components/card";
import { createMockPost } from "../utils/createMocks";

const title = "Starting Again";
const post = createMockPost({ title, id: "4444" });
const mockDelete = jest.fn();

jest.mock("next/link", () => {
  return jest.fn((props: LinkProps) => <>{props.children}</>);
});

const { container, getByTestId } = render(
  <Card public={false} {...post} onDelete={mockDelete} />
);

describe("<Card />", () => {
  it("contains snippet from content", () => {
    const snippet = getByTestId("CARD_EXCERPT").textContent;
    expect(snippet.length).toBeLessThanOrEqual(90);
  });

  it("contains a title", () => {
    expect(post.title).toBe(title);
    expect(getByTestId("CARD_TITLE")).toHaveTextContent(title);
  });

  it("contains delete button", () => {
    expect(getByTestId("CARD_DELETE_BUTTON")).toBeInTheDocument();
  });

  it("matches snapshot", () => {
    expect(container.firstChild).toMatchSnapshot();
  });

  it("should fire a delete", () => {
    fireEvent.click(getByTestId("CARD_DELETE_BUTTON"));

    expect(mockDelete).toHaveBeenCalled();
  });
});
