import * as React from "react";
import classNames from "../utils/classnames";

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const cx = classNames("UIButton", props.className);
  return <button {...props} className={cx} />;
}

export function AltButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const cx = classNames("AltButton", props.className);
  return <button {...props} className={cx} />;
}

export function CancelButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const cx = classNames("CancelButton", props.className);
  return <button {...props} className={cx} />;
}
