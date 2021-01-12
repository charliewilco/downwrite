import React, { InputHTMLAttributes } from "react";
import classNames from "../utils/classnames";

export default function CheckboxInput(
  props: InputHTMLAttributes<HTMLInputElement>
): JSX.Element {
  return (
    <input type="checkbox" {...props} className={classNames("", props.className)} />
  );
}
