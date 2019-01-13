import * as React from "react";
import { render } from "react-testing-library";
import "jest-styled-components";
import "jest-dom/extend-expect";
import Header from "../components/header";
import MockNextContext from "../utils/mock-next-router";

const onClick = jest.fn();

let { getByTestId, container } = render(
  <MockNextContext>
    <Header onClick={onClick} />
  </MockNextContext>
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
