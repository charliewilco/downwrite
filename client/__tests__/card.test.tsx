import Card from "../components/card";
import data from "./db.json";
import { fireEvent, render } from "react-testing-library";

const mockDelete = jest.fn();
const id = "6acebce0-20b6-4015-87fe-951c7bb36481";

jest.mock("next/link", () => {
  return ({ children }) => {
    return children;
  };
});

const PostedCard: React.SFC<any> = () => (
  <Card
    public={false}
    dateAdded={data.posts[0].dateAdded}
    title={data.posts[0].title}
    content={data.posts[0].content}
    id={id}
    onDelete={mockDelete}
  />
);

const { container, getByTestId } = render(<PostedCard />);

describe("<Card />", () => {
  it("contains snippet from content", () => {
    const snippet = getByTestId("CARD_EXCERPT").textContent;
    expect(snippet.length).toBeLessThanOrEqual(90);
  });

  it("contains a title", () => {
    expect(data.posts[0].title).toBe("Starting again");
    expect(getByTestId("CARD_TITLE")).toHaveTextContent("Starting again");
  });

  it("contains delete button", () => {
    expect(getByTestId("CARD_DELETE_BUTTON")).toBeInTheDOM();
  });

  it("matches snapshot", () => {
    expect(container.firstChild).toMatchSnapshot();
  });

  it("should fire a delete", () => {
    fireEvent.click(getByTestId("CARD_DELETE_BUTTON"));

    expect(mockDelete).toHaveBeenCalled();
  });
});
