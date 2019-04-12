import * as React from "react";
import uuid from "uuid/v4";
import * as DefaultStyles from "../utils/defaultStyles";
import { NightModeContext } from "./night-mode";
import classNames from "../utils/classnames";

interface IUIInputProps {
  onChange(e: React.ChangeEvent<any>): void;
  label: string;
  value: string;
  name?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}

export function UIInputContainer({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): JSX.Element {
  return (
    <>
      <div className={classNames("UIInputContainer", className)} {...props} />
      <style jsx>{`
        .UIInputContainer {
          position: relative;
        }

        .UIInputContainer:not(:last-of-type) {
          margin-bottom: 16px;
        }
      `}</style>
    </>
  );
}

export function UIInputError({
  style,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>): JSX.Element {
  return <span style={Object.assign({}, { color: "#d04d36" }, style)} {...props} />;
}

export default function UIInput({ label, ...props }: IUIInputProps) {
  const id = uuid();

  const [active, setActive] = React.useState<boolean>(false);
  const { night } = React.useContext(NightModeContext);

  return (
    <label htmlFor={id}>
      <input
        type="text"
        onFocus={() => setActive(true)}
        onBlur={() => setActive(false)}
        id={id}
        {...props}
      />
      <small>{label}</small>
      <style jsx>{`
        label {
          display: block;
        }

        small {
          font-weight: 700;
          font-family: ${DefaultStyles.Fonts.sans};
          color: ${active ? DefaultStyles.colors.yellow700 : "#b4b4b4"};
          transition: color 250ms ease-in-out;
        }

        input {
          font-family: ${DefaultStyles.Fonts.monospace};
          font-size: 16px;
          font-weight: 400;
          appearance: none;
          display: block;
          border: 0px;
          width: 100%;
          border-radius: 0px;
          border-bottom: 2px solid #b4b4b4;
          transition: border-bottom 250ms ease-in-out;
        }

        input::placeholder {
          color: ${night ? "rgba(255, 255, 255, .25)" : "#d9d9d9"};
          font-weight: 700;
          font-style: italic;
        }

        input:focus {
          outline: none;
          border-bottom: 2px solid ${DefaultStyles.colors.yellow700};
        }
      `}</style>
    </label>
  );
}
