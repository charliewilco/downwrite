import * as React from "react";
import uuid from "uuid/v4";
import styled from "styled-components";
import * as DefaultStyles from "../utils/defaultStyles";

interface InputType {
  onChange(e: React.ChangeEvent<any>): void;
  label: string;
  value: string;
  name?: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
}

interface InputTypeState {
  active: boolean;
}

const StyledInput = styled.input`
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

  &:focus {
    outline: none;
    border-bottom: 2px solid ${DefaultStyles.colors.yellow700};
  }

  &::placeholder {
    color: ${props => (props.theme.night ? "rgba(255, 255, 255, .25)" : "#d9d9d9")};
    font-weight: 700;
    font-style: italic;
  }
`;

const Container = styled.label`
  display: block;
`;

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

const UIInputLabel = styled.small<InputTypeState>`
  font-weight: 700;
  font-family: ${DefaultStyles.fonts.sans};
  color: ${props => (props.active ? DefaultStyles.colors.yellow700 : "#b4b4b4")};
  transition: color 250ms ease-in-out;
`;

const UIInput: React.FC<InputType> = function({ label, ...props }) {
  const id = uuid();

  const [active, setActive] = React.useState<boolean>(false);

  return (
    <Container htmlFor={id}>
      <StyledInput
        type="text"
        onFocus={() => setActive(true)}
        onBlur={() => setActive(false)}
        id={id}
        {...props}
      />
      <UIInputLabel active={active}>{label}</UIInputLabel>
    </Container>
  );
};

export default UIInput;
