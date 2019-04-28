import * as React from "react";
import classNames from "../utils/classnames";

export default function CheckboxInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>): JSX.Element {
  const cx = classNames("UICheck", className);

  return React.createElement("input", { type: "checkbox", ...props, className: cx });
}
