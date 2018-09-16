import * as React from 'react';
import styled from 'styled-components';
import Button from './button';

const HelperButtons = styled.div``;

const HelperContainer = styled.aside`
  display: flex;
  margin-bottom: 16px;
  justify-content: space-between;
  align-items: center;
  padding: 0 8px;
`;
const StyledButton = styled(Button)`
  margin-left: auto;
`;

interface IHelperProps {
  children?: React.ReactNode;
  disabled: boolean;
  onChange: () => void;
  buttonText: string;
}

export default class extends React.Component<IHelperProps> {
  static displayName = 'HelperToolbar';

  render() {
    const { children, buttonText, onChange, disabled } = this.props;
    return (
      <HelperContainer>
        {children}
        <HelperButtons>
          <StyledButton disabled={disabled} onClick={onChange}>
            {buttonText}
          </StyledButton>
        </HelperButtons>
      </HelperContainer>
    );
  }
}
