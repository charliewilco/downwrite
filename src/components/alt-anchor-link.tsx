import * as React from "react";
import classNames from "../utils/classnames";

interface IAltAnchorProps<T> extends React.AnchorHTMLAttributes<T> {
  space?: string;
}

export default React.forwardRef<HTMLAnchorElement, IAltAnchorProps<any>>(
  (props: IAltAnchorProps<any>, ref) => {
    const cx = classNames("AltLink", props.className);
    return (
      <a href={props.href} className={cx} style={props.style} ref={ref}>
        {props.children}
      </a>
    );
  }
);
