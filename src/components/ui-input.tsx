import { useRef, useReducer } from "react";
import { v4 as uuid } from "uuid";

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

enum InputAction {
  BLUR = "BLUR",
  FOCUS = "FOCUS"
}

interface IInputState {
  focused: boolean;
}

interface IInputAction {
  type: InputAction;
}

function inputReducer(_: IInputState, action: IInputAction): IInputState {
  switch (action.type) {
    case InputAction.BLUR:
      return { focused: false };
    case InputAction.FOCUS:
      return { focused: false };
    default:
      throw new Error("Must specify action type");
  }
}

export default function UIInput({ testID, label, ...props }: IUIInputProps) {
  const id = useRef(uuid());

  const [state, dispatch] = useReducer(inputReducer, {
    focused: false
  });

  const className = classNames("UIInputElement", props.className);

  return (
    <label className="UIInputContainer" htmlFor={id.current}>
      <input
        data-testid={testID}
        type="text"
        onFocus={() => dispatch({ type: InputAction.FOCUS })}
        onBlur={() => dispatch({ type: InputAction.BLUR })}
        id={id.current}
        {...props}
        className={className}
      />
      <small
        className="UIInputLabel"
        style={{ color: state.focused ? "var(--yellow700)" : "#b4b4b4" }}>
        {label}
      </small>
    </label>
  );
}
