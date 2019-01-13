import * as React from "react";
import "jest-styled-components";
import "jest-dom/extend-expect";
import { fireEvent, render } from "react-testing-library";

import Card from "../components/card";
import { createMockPost } from "../utils/createMocks";

// jest.mock("next/link", () => {
//   const React = require("react");
//   return ({ children }: { children: React.ReactNode }) => {
//     return children;
//   };
// });

const post = createMockPost({ title: "Starting Again" });

const PostedCard: React.SFC<any> = ({ onDelete }) => (
  <Card public={false} {...post} onDelete={onDelete} />
);

const { container, getByTestId } = render(<PostedCard />);

describe("<Card />", () => {
  it("contains snippet from content", () => {
    const snippet = getByTestId("CARD_EXCERPT").textContent;
    expect(snippet.length).toBeLessThanOrEqual(90);
  });

  it("contains a title", () => {
    expect(post.title).toBe("Starting again");
    expect(getByTestId("CARD_TITLE")).toHaveTextContent("Starting again");
  });

  it("contains delete button", () => {
    expect(getByTestId("CARD_DELETE_BUTTON")).toBeInTheDocument();
  });

  it("matches snapshot", () => {
    expect(container.firstChild).toMatchSnapshot();
  });

  it("should fire a delete", () => {
    const mockDelete = jest.fn();

    const { getByTestId } = render(<PostedCard onDelete={mockDelete} />);

    fireEvent.click(getByTestId("CARD_DELETE_BUTTON"));

    expect(mockDelete).toHaveBeenCalled();
  });
});
