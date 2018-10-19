import Preview from "../pages/preview";
import { Content } from "../components/content";
import { render, wait } from "react-testing-library";
import "dom-testing-library/extend-expect";
import data from "./db.json";
const id = "6acebce0-20b6-4015-87fe-951c7bb36481";

let post = data.posts[0];

describe("<Preview />", () => {
  it("loads server content", async () => {
    fetch.mockResponse(JSON.stringify(post));
    let FetchContent = render(<Preview {...post} />);
    await wait(() => FetchContent.getByTestId("PREVIEW_ENTRTY_TITLE"));
    expect(FetchContent.container).toBeTruthy();
    expect(FetchContent.getByTestId("PREVIEW_ENTRTY_TITLE")).toHaveTextContent(
      "React Testing"
    );
    expect(FetchContent.getByTestId("PREVIEW_ENTRTY_BODY")).toBeInTheDOM();
  });
  it("takes static content", () => {
    let StaticContent = render(<Content {...post} />);
    expect(StaticContent.getByTestId("PREVIEW_ENTRTY_TITLE")).toHaveTextContent(
      "React Testing"
    );
  });
});
