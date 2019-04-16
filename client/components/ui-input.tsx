import * as React from "react";
import uuid from "uuid/v4";

import classNames from "../utils/classnames";

interface IUIInputProps {
  onChange(e: React.ChangeEvent<any>): void;
  label: string;
  value: string;
  name?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  className?: string;
}

export function UIInputContainer({
  ...props
}: React.HTMLAttributes<HTMLDivElement>): JSX.Element {
  const className = classNames("UIInputContainer", props.className);
  return <div {...props} className={className} />;
}

export function UIInputError({
  style,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>): JSX.Element {
  const className = classNames("UIInputError", props.className);

  return <span {...props} className={className} />;
}

export default function UIInput({ label, ...props }: IUIInputProps) {
  const id = uuid();

  const [active, setActive] = React.useState<boolean>(false);

  const className = classNames("UIInputElement", props.className);

  return (
    <label className="UIInputContainer" htmlFor={id}>
      <input
        type="text"
        onFocus={() => setActive(true)}
        onBlur={() => setActive(false)}
        id={id}
        {...props}
        className={className}
      />
      <small
        className="UIInputLabel"
        style={{ color: active ? "var(--yellow700)" : "#b4b4b4" }}>
        {label}
      </small>
    </label>
  );
}
