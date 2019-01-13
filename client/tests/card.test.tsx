import * as React from "react";
import "jest-styled-components";
import "jest-dom/extend-expect";
import { fireEvent, render } from "react-testing-library";

import Card from "../components/card";
import { createMockPost } from "../utils/createMocks";
import MockNextContext from "../utils/mock-next-router";

const title = "Starting Again";
const post = createMockPost({ title, id: "4444" });
const mockDelete = jest.fn();

const { container, getByTestId } = render(
  <MockNextContext>
    <Card public={false} {...post} onDelete={mockDelete} />
  </MockNextContext>
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
