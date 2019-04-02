import * as React from "react";
import "jest-dom/extend-expect";
import { Button } from "../components/button";
import { render, fireEvent } from "react-testing-library";

const onClickHandler = jest.fn();
const { getByText } = render(
  <Button data-testid="TESTING_BUTTON" onClick={onClickHandler}>
    Button
  </Button>
);

describe("<Button />", () => {
  it("Fires onClick", () => {
    fireEvent.click(getByText("Button"));
    expect(onClickHandler).toHaveBeenCalled();
  });
});
