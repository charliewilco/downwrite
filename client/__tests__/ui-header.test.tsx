import { render, Simulate, wait } from "react-testing-library";
import "dom-testing-library/extend-expect";
import { withRouter } from "next/router";

import Header from "../components/header";

let { getByTestId, container } = render(
  withRouter(props => <Header authed name="Downwrite" {...props} />)
);

describe("Header Component", () => {
  it("contains application name", () => {
    expect(getByTestId("APP_HEADER_TITLE")).toHaveTextContent("Downwrite");
    expect(getByTestId("APP_HEADER")).toBeTruthy();
  });

  it("matches snapshot", () => {
    expect(container.firstChild).toMatchSnapshot();
  });
});
