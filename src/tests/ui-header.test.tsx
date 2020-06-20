import * as React from "react";
import { render } from "@testing-library/react";
import { UIHeader } from "../components/header";
import { MockAuthProvider } from "../utils/testing";

jest.mock("universal-cookie", () => {
  return class Cookie {};
});
jest.mock("jwt-decode");

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
