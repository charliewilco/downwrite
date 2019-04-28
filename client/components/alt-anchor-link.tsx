import * as React from "react";
import classNames from "../utils/classnames";

interface IAltAnchorProps<T> extends React.AnchorHTMLAttributes<T> {
  space?: string;
}

export default function AltAnchorLink({
  space,
  className,
  children,
  ...props
}: IAltAnchorProps<any>): JSX.Element {
  const cx = classNames("AltLink", className);
  return React.createElement("a", { ...props, className: cx }, children);
}
