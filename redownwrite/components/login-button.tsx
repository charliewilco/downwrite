import * as React from 'react';
import styled from 'styled-components';
import { colors } from '../utils/defaultStyles';

const StyledLoginButton = styled.button`
  padding: 8px;
  color: ${colors.yellow700};
  border: 0px;
  background: none;
  font-family: inherit;
  font-weight: 700;
  font-style: italic;
  box-sizing: inherit;

  &:hover {
    color: ${colors.yellow500};
  }
`;

interface ILoginButton {
  onClick: () => void;
  label: string;
}

export default class extends React.Component<ILoginButton, void> {
  static displayName = 'LoginButton';

  static defaultProps = {
    label: 'Submit'
  };

  render() {
    const { label, onClick } = this.props;
    return <StyledLoginButton onClick={onClick}>{label}</StyledLoginButton>;
  }
}
