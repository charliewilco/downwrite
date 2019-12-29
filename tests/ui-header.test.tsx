import * as React from "react";
import { render } from "@testing-library/react";
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

describe("Header Component", () => {
  it("contains application name", () => {
    const utils = render(
      <MockAuthProvider>
        <UIHeader />
      </MockAuthProvider>
    );

    const title = utils.container.querySelector("h1");
    const header = utils.container.querySelector("header");

    expect(title.textContent).toBe("Downwrite");
    expect(header).toBeTruthy();
  });
});
