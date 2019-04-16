import "jest";
import * as React from "react";
import "jest-dom/extend-expect";
import { render, fireEvent } from "react-testing-library";
import useToggle from "../hooks/toggle";

const ToggleDemo = () => {
  const [isOpen, { onToggle }] = useToggle();
  return (
    <>
      {isOpen && <h1 data-testid="TOGGLE_OPEN">I am open</h1>}
      <button data-testid="TOGGLE_BUTTON" onClick={onToggle}>
        Toggle
      </button>
    </>
  );
};

const ToggleDemoOpen = () => {
  const [isOpen] = useToggle(true);
  return <>{isOpen && <h1 data-testid="TOGGLE_OPEN">I am open</h1>}</>;
};

let { getByTestId, container } = render(<ToggleDemo />);

describe("<Toggle />", () => {
  it("starts closed", () => {
    expect(
      container.querySelector(`[data-testid="TOGGLE_OPEN"]`)
    ).not.toBeInTheDocument();
  });

  it("can be toggled open", () => {
    fireEvent.click(getByTestId("TOGGLE_BUTTON"));
    expect(getByTestId("TOGGLE_OPEN")).toHaveTextContent("I am open");
  });

  it("can be open by default", () => {
    const { container: openContainer } = render(<ToggleDemoOpen />);
    expect(
      openContainer.querySelector(`[data-testid="TOGGLE_OPEN"]`)
    ).toBeInTheDocument();
  });
});
