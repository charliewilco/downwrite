import * as React from "react";
import { render } from "react-testing-library";
import "jest-styled-components";
import "jest-dom/extend-expect";
import Header from "../components/header";

jest.mock("next/link");
jest.mock("next/router");
jest.mock("universal-cookie", () => {
  return class Cookie {};
});
jest.mock("jwt-decode");
jest.mock("../components/auth");

let { getByTestId, container } = render(<Header />);

// jest.mock("../components/auth", () => () => "Auth");

describe("Header Component", () => {
  it("contains application name", () => {
    expect(getByTestId("APP_HEADER_TITLE")).toHaveTextContent("Downwrite");
    expect(getByTestId("APP_HEADER")).toBeTruthy();
  });

  it("matches snapshot", () => {
    expect(container.firstChild).toMatchSnapshot();
  });
});
