import Card from "../components/card";
import { withRouter } from "next/router";
import { posts } from "./db.json";
import * as Testing from "react-testing-library";
import "dom-testing-library/extend-expect";

const mockDelete = jest.fn();
const id = "6acebce0-20b6-4015-87fe-951c7bb36481";

const { container, getByTestId } = Testing.render(
  withRouter(props => (
    <Card
      title="Starting Again"
      content={posts[0].content}
      id={id}
      onDelete={mockDelete}
      {...props}
    />
  ))
);

describe("<Card />", () => {
  it("contains snippet from content", () => {
    const snippet = getByTestId("CARD_EXCERPT").textContent;
    expect(snippet.length).toBeLessThanOrEqual(90);
  });

  it("contains a title", () => {
    expect(getByTestId("CARD_TITLE")).toHaveTextContent("Starting Again");
  });

  // TODO: snapshots are going to be fucked for a while until
  // converted to next.js
  it("matches snapshot", () => {
    expect(container.firstChild).toMatchSnapshot();
  });

  it("should fire a delete", () => {
    Testing.Simulate.click(getByTestId("CARD_DELETE_BUTTON"));

    expect(mockDelete).toHaveBeenCalled();
  });
});
