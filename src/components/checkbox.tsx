import { createElement, InputHTMLAttributes } from "react";
import classNames from "../utils/classnames";

export default function CheckboxInput(
  props: InputHTMLAttributes<HTMLInputElement>
): JSX.Element {
  return createElement("input", {
    type: "checkbox",
    ...props,
    className: classNames("UICheck", props.className)
  });
}
