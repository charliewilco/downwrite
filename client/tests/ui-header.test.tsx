import * as React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { UIHeader } from "../components/header";
import { LinkProps } from "next/link";
import { MockAuthProvider } from "../components/auth";

jest.mock("universal-cookie", () => {
  return class Cookie {};
});
jest.mock("jwt-decode");

jest.mock("next/link", () => {
  return jest.fn((props: React.PropsWithChildren<LinkProps>) => (
    <>{props.children}</>
  ));
});

let { getByTestId, container } = render(
  <MockAuthProvider>
    <UIHeader />
  </MockAuthProvider>
);

// NOTE: test broken by upgrading @testing-library
describe("Header Component", () => {
  it("contains application name", () => {
    expect(getByTestId("APP_HEADER_TITLE")).toHaveTextContent("Downwrite");
    expect(getByTestId("APP_HEADER")).toBeTruthy();
  });

  it("matches snapshot", () => {
    expect(container.firstChild).toMatchSnapshot();
  });
});
