import * as React from "react";
import uuid from "uuid/v4";
import styled from "styled-components";
import * as DefaultStyles from "../utils/defaultStyles";
import { NightModeContext } from "./night-mode";

interface InputType {
  onChange(e: React.ChangeEvent<any>): void;
  label: string;
  value: string;
  name?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}

export const UIInputContainer = styled.div`
  position: relative;
  &:not(:last-of-type) {
    margin-bottom: 16px;
  }
`;

export const UIInputError = styled.small`
  color: #d04d36;
`;

export const UIInputToggle = styled.input.attrs({ type: "checkbox" })<{
  isOpen: boolean;
}>``;

const UIInput: React.FC<InputType> = function({ label, ...props }) {
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
          font-family: ${DefaultStyles.fonts.sans};
          color: ${active ? DefaultStyles.colors.yellow700 : "#b4b4b4"};
          transition: color 250ms ease-in-out;
        }

        input {
          font-family: ${DefaultStyles.fonts.monospace};
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
};

export default UIInput;
