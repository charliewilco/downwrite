import { useRef, useReducer } from "react";
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
  testID?: string;
}

export function UIInputContainer({
  ...props
}: React.HTMLAttributes<HTMLDivElement>): JSX.Element {
  const className = classNames("relative", props.className);
  return <div {...props} className={className} />;
}

export function UIInputError({
  style,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>): JSX.Element {
  return (
    <span
      {...props}
      className={classNames(
        "block text-sm text-red-500 dark:text-red-300",
        props.className
      )}
    />
  );
}

export default function UIInput({ testID, label, ...props }: IUIInputProps) {
  const id = useRef("UI_TEXT_INPUT_".concat(label.replace(" ", "")));

  const [isFocused, dispatch] = useReducer(
    (state: boolean, action: "focus" | "blur") => {
      return action !== "blur";
    },
    false
  );

  return (
    <label className="relative" htmlFor={id.current}>
      <input
        data-testid={testID}
        type="text"
        onFocus={() => dispatch("focus")}
        onBlur={() => dispatch("blur")}
        id={id.current}
        {...props}
        className={classNames(
          "font-mono text-sm font-normal py-2 px-0 appearance-none block w-full border-0 border-b-2 border-onyx-400 bg-transparent",
          props.className
        )}
      />
      <small
        className="font-bold"
        style={{ color: isFocused ? "var(--yellow700)" : "#b4b4b4" }}>
        {label}
      </small>
    </label>
  );
}
