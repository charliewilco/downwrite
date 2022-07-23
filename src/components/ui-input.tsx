import { useRef, useReducer } from "react";

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

export function UIInputError({
  style,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span {...props}>
      {props.children}
      <style jsx>{`
        span {
          display: block;
          font-size: small;
          color: red;
        }
      `}</style>
    </span>
  );
}

export function UIInput({ testID, label, ...props }: IUIInputProps) {
  const id = useRef("UI_TEXT_INPUT_".concat(label.replace(" ", "")));

  const [isFocused, dispatch] = useReducer(
    (state: boolean, action: "focus" | "blur") => {
      return action !== "blur";
    },
    false
  );

  return (
    <label htmlFor={id.current}>
      <input
        data-testid={testID}
        type="text"
        onFocus={() => dispatch("focus")}
        onBlur={() => dispatch("blur")}
        id={id.current}
        {...props}
      />
      <small style={{ color: isFocused ? "var(--goldar700)" : "#b4b4b4" }}>
        {label}
      </small>
      <style jsx>{`
        label {
          display: block;
          position: relative;
        }
        small {
          padding-top: 0.5rem;
          display: block;
        }
        input {
          font-family: var(--monospace);
          width: 100%;
          padding: 0.5rem 0;
          appearance: none;
          display: block;
          border-radius: 0;
          border: 0;
          background: transparent;
          border-bottom: 2px solid var(--onyx-400);
          color: inherit;
        }
      `}</style>
    </label>
  );
}

export function EditorInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <input type="text" {...props} />
      <style jsx>{`
        input {
          font-family: var(--monospace);
          width: 100%;
          border: 0;
          display: block;
          appearance: none;
          background: transparent;
          border-radius: 0;
          outline: none;
          padding: 0.5rem 0;
          font-size: 2.25rem;
          line-height: 2.5rem;
          color: inherit;
        }
      `}</style>
    </div>
  );
}
