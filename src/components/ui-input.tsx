import { useRef, useReducer } from "react";
import { inputReducer, InputAction } from "../reducers/input";
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

  const [state, dispatch] = useReducer(inputReducer, {
    focused: false
  });

  return (
    <label className="relative" htmlFor={id.current}>
      <input
        data-testid={testID}
        type="text"
        onFocus={() => dispatch({ type: InputAction.FOCUS })}
        onBlur={() => dispatch({ type: InputAction.BLUR })}
        id={id.current}
        {...props}
        className={classNames(
          "font-mono text-sm font-normal py-2 px-0 appearance-none block w-full border-0 border-b-2 border-onyx-400 bg-transparent",
          props.className
        )}
      />
      <small
        className="font-bold"
        style={{ color: state.focused ? "var(--yellow700)" : "#b4b4b4" }}>
        {label}
      </small>
    </label>
  );
}
