import * as React from "react";
import styled from "../types/styled-components";
import * as DefaultStyles from "../utils/defaultStyles";

const StyledInput = styled.input`
  display: block;
  width: 100%;
  appearance: none;
  font-weight: 400;
  color: inherit;
  font-family: ${DefaultStyles.fonts.sans};
  background: none;
  font-size: 150%;
  border-width: 0px;
  border-bottom: 1px;
  border-style: solid;
  border-radius: 0px;
  border-color: ${props => props.theme.inputBorder};
  padding-left: 0px;
  padding-right: 0px;
  padding-top: 8px;
  padding-bottom: 8px;
  outline: none;
  transition: border-color 250ms linear;

  &:focus {
    border-color: ${props => props.theme.link};
  }
`;

interface IInputProps {
  type: string;
  inputRef?: React.RefObject<any>;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  value: any;
  name?: string;
}

export default class Input extends React.Component<IInputProps, any> {
  static defaultProps = {
    type: "text"
  };

  render() {
    const { onChange, inputRef, ...props } = this.props;

    return <StyledInput ref={inputRef} onChange={e => onChange(e)} {...props} />;
  }
}
