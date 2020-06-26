import { forwardRef, AnchorHTMLAttributes } from "react";
import classNames from "../utils/classnames";

interface IAltAnchorProps<T> extends AnchorHTMLAttributes<T> {
  space?: string;
}

export default forwardRef<HTMLAnchorElement, IAltAnchorProps<unknown>>(
  (props: IAltAnchorProps<unknown>, ref) => {
    const cx = classNames("AltLink", props.className);
    return (
      <a href={props.href} className={cx} style={props.style} ref={ref}>
        {props.children}
      </a>
    );
  }
);
