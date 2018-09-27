import * as React from 'react';
import uuid from 'uuid/v4';
import styled from 'styled-components';
import { colors, fonts } from '../utils/defaultStyles';

interface InputType {
  label: string;
  onChange: (x) => void;
  value: string;
  type: string;
  placeholder?: string;
  autoComplete?: string;
}

interface InputTypeState {
  active: boolean;
}

const StyledInput = styled.input`
  font-family: ${fonts.monospace};
  font-size: 16px;
  appearance: none;
  display: block;
  border: 0px;
  width: 100%;
  border-radius: 0px;
  border-bottom: 2px solid #b4b4b4;
  transition: border-bottom 250ms ease-in-out;

  &:focus {
    outline: none;
    border-bottom: 2px solid ${colors.yellow700};
  }

  &::placeholder {
    color: #d9d9d9;
    font-style: italic;
  }
`;

const InputContainer = styled.label`
  display: block;

  &:not(:last-of-type) {
    margin-bottom: 16px;
  }
`;

const InputLabel = styled.small`
  text-transform: uppercase;
  letter-spacing: 1px;
  color: ${(props: InputTypeState) => (props.active ? colors.yellow700 : '#b4b4b4')};
  transition: color 250ms ease-in-out;
`;

export default class extends React.Component<InputType, InputTypeState> {
  state = {
    active: false
  };

  static displayName = 'LoginInput';

  static defaultProps = {
    type: 'text'
  };

  render() {
    const id = uuid();
    const { active } = this.state;
    const { label } = this.props;
    return (
      <InputContainer htmlFor={id}>
        <StyledInput
          onFocus={() => this.setState({ active: true })}
          onBlur={() => this.setState({ active: false })}
          id={id}
          {...this.props}
        />
        <InputLabel active={active}>{label}</InputLabel>
      </InputContainer>
    );
  }
}
