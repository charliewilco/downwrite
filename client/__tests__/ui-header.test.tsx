import { render } from "react-testing-library";
import { ExtendedMatchers } from "./config/setupTests";
import Header from "../components/header";

let { getByTestId, container } = render(
  <Header router={{ route: "/" }} authed name="Downwrite" />
);

jest.mock("next/link", () => {
  return ({ children }) => {
    return children;
  };
});

describe("Header Component", () => {
  it("contains application name", () => {
    expect(getByTestId("APP_HEADER_TITLE")).toHaveTextContent("Downwrite");
    expect(getByTestId("APP_HEADER")).toBeTruthy();
  });

  it("matches snapshot", () => {
    expect(container.firstChild).toMatchSnapshot();
  });
});
