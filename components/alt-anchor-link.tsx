import * as React from "react";
import classNames from "../utils/classnames";

interface IAltAnchorProps<T> extends React.AnchorHTMLAttributes<T> {
  space?: string;
}

export const AltAnchorLink = React.forwardRef<IAltAnchorProps<any>>(
  ({ space, className, children, ...props }, ref) => {
    const cx = classNames("AltLink", className);
    return (
      <a {...props} className={cx} ref={ref}>
        {children}
      </a>
    );
  }
);

export default AltAnchorLink;
