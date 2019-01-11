import Card from "../components/card";
import { fireEvent, render } from "react-testing-library";
import { createMockPost } from "./config/createMocks";

const mockDelete = jest.fn();

jest.mock("next/link", () => {
  return ({ children }: { children: React.ReactNode }) => {
    return children;
  };
});

const post = createMockPost({ title: "Starting Again" });

const PostedCard: React.SFC<any> = () => (
  <Card public={false} {...post} onDelete={mockDelete} />
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
    fireEvent.click(getByTestId("CARD_DELETE_BUTTON"));

    expect(mockDelete).toHaveBeenCalled();
  });
});
