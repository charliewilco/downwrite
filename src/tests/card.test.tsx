import * as React from "react";
import { fireEvent, render, waitForElement } from "@testing-library/react";
import Card from "../components/card";
import { createMockPost } from "../utils/testing";
import { MemoryRouter } from "react-router-dom";

const title = "Starting Again";
const post = createMockPost({ title, id: "4444" });
const mockDelete = jest.fn();

describe("<Card />", () => {
  it("contains snippet from content", () => {
    const TestCard = render(
      <MemoryRouter>
        <Card public={false} {...post} onDelete={mockDelete} />
      </MemoryRouter>
    );
    const snippet = TestCard.getByTestId("CARD_EXCERPT").textContent;
    expect(snippet.length).toBeLessThanOrEqual(90);
  });

  it("contains a title", () => {
    const TestCard = render(
      <MemoryRouter>
        <Card public={false} {...post} onDelete={mockDelete} />{" "}
      </MemoryRouter>
    );
    expect(post.title).toBe(title);
    expect(TestCard.getByTestId("CARD_TITLE")).toHaveTextContent(title);
  });

  it("contains delete button", async () => {
    const TestCard = render(
      <MemoryRouter>
        <Card public={false} {...post} onDelete={mockDelete} />
      </MemoryRouter>
    );
    const deleteButton = await waitForElement(() =>
      TestCard.getByTestId("CARD_DELETE_BUTTON")
    );
    expect(deleteButton).toBeInTheDocument();
    fireEvent.click(deleteButton);

    expect(mockDelete).toHaveBeenCalled();
  });

  it("matches snapshot", () => {
    const TestCard = render(
      <MemoryRouter>
        <Card public={false} {...post} onDelete={mockDelete} />
      </MemoryRouter>
    );
    expect(TestCard.container.firstChild).toMatchSnapshot();
  });
});
