import { render, fireEvent } from "react-testing-library";
import Check from "../components/checkbox";

const checkFire = jest.fn();

let { getByTestId, container } = render(
  <label data-testid="TEST_CHECKBOX_LABEL">
    <Check data-testid="TEST_CHECKBOX" />
  </label>
);

describe("<Check />", () => {
  xit("checks", () => {
    expect(container.querySelector("input:checked")).not.toBeInTheDOM();
    fireEvent.click(getByTestId("TEST_CHECKBOX_LABEL"));
    expect(container.querySelector("input:checked")).toBeInTheDOM();
  });

  it("matches snapshot", () => {
    expect(container.firstChild).toMatchSnapshot();
  });
});
