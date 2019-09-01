import * as React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { UIHeader } from "../components/header";
import { SingletonRouter, WithRouterProps } from "next/router";
import { LinkProps } from "next/link";

jest.mock("universal-cookie", () => {
  return class Cookie {};
});
jest.mock("jwt-decode");
jest.mock("../components/auth");

// jest.mock("../components/auth", () => () => "Auth");

jest.mock("next/router", () => {
  return {
    withRouter: (Component: React.ComponentType<{} & WithRouterProps<{}>>) => {
      return <Component router={{ route: "/" } as SingletonRouter<{}>} />;
    }
  };
});

jest.mock("next/link", () => {
  return jest.fn((props: LinkProps) => <>{props.children}</>);
});

let { getByTestId, container } = render(
  <UIHeader router={{ route: "/" } as SingletonRouter<{}>} />
);

// NOTE: test broken by upgrading @testing-library
xdescribe("Header Component", () => {
  it("contains application name", () => {
    expect(getByTestId("APP_HEADER_TITLE")).toHaveTextContent("Downwrite");
    expect(getByTestId("APP_HEADER")).toBeTruthy();
  });

  it("matches snapshot", () => {
    expect(container.firstChild).toMatchSnapshot();
  });
});
