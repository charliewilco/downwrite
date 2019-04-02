import * as React from "react";
import "jest-dom/extend-expect";
import { render, fireEvent } from "react-testing-library";
import Check from "../components/checkbox";

let { getByTestId, container } = render(
  <label data-testid="TEST_CHECKBOX_LABEL" htmlFor="check">
    <Check data-testid="TEST_CHECKBOX" id="check" />
  </label>
);

describe("<Check />", () => {
  it("checks", () => {
    expect(getByTestId("TEST_CHECKBOX")).toBeInTheDocument();
    fireEvent.click(getByTestId("TEST_CHECKBOX_LABEL"));
    expect((getByTestId("TEST_CHECKBOX") as HTMLInputElement).checked).toBe(true);
  });

  it("matches snapshot", () => {
    expect(container.firstChild).toMatchSnapshot();
  });
});
