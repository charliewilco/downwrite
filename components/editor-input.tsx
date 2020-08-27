import * as React from "react";
import classNames from "../utils/classnames";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const cx = classNames("EditorInput", props.className);
  return <input type="text" {...props} className={cx} />;
}
