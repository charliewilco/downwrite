import * as React from "react";
import classNames from "../utils/classnames";

export default function CheckboxInput(
  props: React.InputHTMLAttributes<HTMLInputElement>
): JSX.Element {
  return React.createElement("input", {
    type: "checkbox",
    ...props,
    className: classNames("UICheck", props.className)
  });
}
