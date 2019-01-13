import * as React from "react";
import { render } from "react-testing-library";
import "jest-styled-components";
import "jest-dom/extend-expect";
import Header from "../components/header";

const onClick = jest.fn();

let { getByTestId, container } = render(<Header onClick={onClick} />);

jest.mock("next/link", () => {
  return ({ children }: { children: React.ReactNode }) => {
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
