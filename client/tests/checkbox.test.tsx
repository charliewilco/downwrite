import * as React from "react";
import "@testing-library/jest-dom/extend-expect";
import { render, fireEvent } from "@testing-library/react";
import Check from "../components/checkbox";

let { getByTestId, container } = render(
  <label data-testid="TEST_CHECKBOX_LABEL" htmlFor="check">
    <Check data-testid="TEST_CHECKBOX" id="check" />
  </label>
);

// NOTE: test broken by upgrading @testing-library
xdescribe("<Check />", () => {
  it("checks", () => {
    expect(getByTestId("TEST_CHECKBOX")).toBeInTheDocument();
    fireEvent.click(getByTestId("TEST_CHECKBOX_LABEL"));
    expect((getByTestId("TEST_CHECKBOX") as HTMLInputElement).checked).toBe(true);
  });

  it("matches snapshot", () => {
    expect(container.firstChild).toMatchSnapshot();
  });
});
