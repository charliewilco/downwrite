import Toggle from "../components/toggle";
import { render, fireEvent } from "react-testing-library";

let { getByTestId, container } = render(
  <Toggle>
    {({ isOpen, onToggle }) => (
      <>
        {isOpen && <h1 data-testid="TOGGLE_OPEN">I am open</h1>}
        <button data-testid="TOGGLE_BUTTON" onClick={onToggle}>
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
    fireEvent.click(getByTestId("TOGGLE_BUTTON"));
    expect(getByTestId("TOGGLE_OPEN")).toHaveTextContent("I am open");
  });

  it("can be open by default", () => {
    const { container: openContainer } = render(
      <Toggle defaultOpen>
        {({ isOpen }) => isOpen && <h1 data-testid="TOGGLE_OPEN">I am open</h1>}
      </Toggle>
    );
    expect(
      openContainer.querySelector(`[data-testid="TOGGLE_OPEN"]`)
    ).toBeInTheDOM();
  });
});
