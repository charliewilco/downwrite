import * as React from "react";
import classNames from "../utils/classnames";

interface IAltAnchorProps<T> extends React.AnchorHTMLAttributes<T> {
  space?: string;
}

export const AltAnchorLink = React.forwardRef<IAltAnchorProps<any>, any>(
  ({ className, children, ...props }, ref) => (
    <a {...props} className={classNames("AltLink", className)} ref={ref}>
      {children}
    </a>
  )
);

export default AltAnchorLink;
