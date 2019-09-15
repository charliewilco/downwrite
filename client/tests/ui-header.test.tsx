import * as React from "react";
import * as ReactDOM from "react-dom";
import TestRenderer from "react-test-renderer";

import { UIHeader } from "../components/header";
import { LinkProps } from "next/link";
import { MockAuthProvider } from "../components/auth";
import { act } from "react-dom/test-utils";

jest.mock("universal-cookie", () => {
  return class Cookie {};
});
jest.mock("jwt-decode");

jest.mock("next/link", () => {
  return jest.fn((props: React.PropsWithChildren<LinkProps>) => (
    <>{props.children}</>
  ));
});

const app = (
  <MockAuthProvider>
    <UIHeader />
  </MockAuthProvider>
);

let container: HTMLDivElement;

const testMock = TestRenderer.create(app);

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  document.body.removeChild(container);
  container = null;
});

// NOTE: test broken by upgrading @testing-library
describe("Header Component", () => {
  it("contains application name", () => {
    act(() => {
      ReactDOM.render(app, container);
    });

    const title = container.querySelector("h1");
    const header = container.querySelector("header");

    expect(title.textContent).toBe("Downwrite");
    expect(header).toBeTruthy();
  });

  it("matches snapshot", () => {
    expect(testMock.toJSON()).toMatchSnapshot();
  });
});
