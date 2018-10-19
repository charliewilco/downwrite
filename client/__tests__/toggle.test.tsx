import Toggle from "../components/toggle";
import { render, Simulate } from "react-testing-library";
import "dom-testing-library/extend-expect";

let { getByText, getByTestId, container } = render(
  <Toggle>
    {(open, toggle) => (
      <>
        {open && <h1 data-testid="TOGGLE_OPEN">I am open</h1>}
        <button data-testid="TOGGLE_BUTTON" onClick={toggle}>
          Toggle
        </button>
      </>
    )}
  </Toggle>
);

describe("<Toggle />", () => {
  it("starts closed", () => {
    expect(
      container.querySelector(`[data-testid="TOGGLE_OPEN"]`)
    ).not.toBeInTheDOM();
  });

  it("can be toggled open", () => {
    Simulate.click(getByTestId("TOGGLE_BUTTON"));
    expect(getByTestId("TOGGLE_OPEN")).toHaveTextContent("I am open");
  });

  xit("can be open by default", () => {
    expect(render(<Toggle defaultOpen>{() => null}</Toggle>)).toBe(true);
  });
});
