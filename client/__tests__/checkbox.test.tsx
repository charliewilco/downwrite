import { render, fireEvent } from "react-testing-library";
import Check from "../components/checkbox";

const checkFire = jest.fn();

let { getByTestId, container } = render(
  <label data-testid="TEST_CHECKBOX_LABEL" htmlFor="check">
    <Check data-testid="TEST_CHECKBOX" id="check" />
  </label>
);

describe("<Check />", () => {
  it("checks", () => {
    expect(getByTestId("TEST_CHECKBOX")).toBeInTheDOM();
    fireEvent.click(getByTestId("TEST_CHECKBOX_LABEL"));
    expect(getByTestId("TEST_CHECKBOX").checked).toBe(true);
  });

  it("matches snapshot", () => {
    expect(container.firstChild).toMatchSnapshot();
  });
});
