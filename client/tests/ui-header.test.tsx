import * as React from "react";
import { render } from "react-testing-library";
import "jest-dom/extend-expect";
import { UIHeader } from "../components/header";
import { SingletonRouter } from "next/router";

jest.mock("universal-cookie", () => {
  return class Cookie {};
});
jest.mock("jwt-decode");
jest.mock("../components/auth");

// jest.mock("../components/auth", () => () => "Auth");

jest.mock("next/router", () => {
  return {
    withRouter: Component => {
      return <Component router={{ route: "/" } as SingletonRouter<{}>} />;
    }
  };
});

jest.mock("next/link", () => {
  return jest.fn(props => <>{props.children}</>);
});

let { getByTestId, container } = render(
  <UIHeader router={{ route: "/" } as SingletonRouter<{}>} />
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
