import * as React from "react";
import classNames from "../utils/classnames";

interface AltAnchorProps<T> extends React.AnchorHTMLAttributes<T> {
  space?: string;
}

export default function AltAnchorLink({
  space,
  className,
  ...props
}: AltAnchorProps<any>): JSX.Element {
  const cx = classNames("AltLink", className);
  return <a {...props} className={cx} />;
}
