import * as React from "react";
import { render } from "@testing-library/react";
import { UIHeader } from "../components/header";
import { MockAuthProvider } from "../utils/testing";
import { MemoryRouter } from "react-router-dom";

jest.mock("universal-cookie", () => {
  return class Cookie {};
});
jest.mock("jwt-decode");

describe("Header Component", () => {
  it("contains application name", () => {
    const utils = render(
      <MemoryRouter>
        <MockAuthProvider>
          <UIHeader />
        </MockAuthProvider>
      </MemoryRouter>
    );

    const title = utils.container.querySelector("h1");
    const header = utils.container.querySelector("header");

    expect(title.textContent).toBe("Downwrite");
    expect(header).toBeTruthy();
  });
});
