import { render, wait } from "react-testing-library";
import Dashboard from "../pages/index";
import data from "./db.json";

const PostDashboard = () => (
  <Dashboard entries={data.posts} token="..." closeNav={() => {}} />
);

jest.mock("next/link", () => {
  return ({ children }) => {
    return children;
  };
});

describe("<Dashboard /> post lists", () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  it("shows list of Cards if authed and has posts", async () => {
    fetch.mockResponseOnce(JSON.stringify(data.posts));
    let { container, getByTestId } = render(<PostDashboard />);
    await wait(() => getByTestId("CARD"));

    expect(container).toBeTruthy();
    expect(getByTestId("CARD")).toHaveTextContent("Starting again");
  });

  xit("can toggle from grid to list", async () => {});
  xit("shows prompt to write more if no posts", async () => {});
  xit("can prompt to delete", async () => {});
});
