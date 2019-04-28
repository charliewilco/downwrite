import * as React from "react";
import classNames from "../utils/classnames";

type IButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button(props: IButtonProps): JSX.Element {
  return React.createElement("button", {
    ...props,
    className: classNames("UIButton", props.className)
  });
}

export function AltButton(props: IButtonProps): JSX.Element {
  return React.createElement("button", {
    ...props,
    className: classNames("AltButton", props.className)
  });
}

export function CancelButton(props: IButtonProps): JSX.Element {
  return React.createElement("button", {
    ...props,
    className: classNames("CancelButton", props.className)
  });
}
