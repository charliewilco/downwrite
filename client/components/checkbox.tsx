import * as React from "react";
import classNames from "../utils/classnames";

export default function CheckboxInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  const cx = classNames("UICheck", className);

  return <input type="checkbox" {...props} className={cx} />;
}
