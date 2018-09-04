import * as React from 'react'
import styled from 'styled-components'
import Toggle from './toggle'
import Button from './button'
import Chevron from './chevron'

const HelperButtons = styled.div``

const ChevronButton = styled.button`
  outline: 0;
  border: 0;
  appearance: none;
  font-family: inherit;
`

const HelperContainer = styled.aside`
  display: flex;
  margin-bottom: 16px;
  justify-content: space-between;
  align-items: center;
  padding: 0 8px;
`
const StyledButton = styled(Button)`
  margin-left: auto;
`

const Toggler = () => (
  <Toggle defaultOpen>
    {(open, toggle) => (
      <ChevronButton onClick={toggle}>
        <Chevron open={open} />
      </ChevronButton>
    )}
  </Toggle>
)

interface IHelperProps {
  children?: React.ReactNode;
  disabled: boolean;
  onChange: () => void;
  buttonText: string;
}

export default class extends React.Component<IHelperProps> {
  static displayName = 'HelperToolbar'

  render() {
    const { children, buttonText, onChange, disabled } = this.props
    return (
      <HelperContainer>
        {children}
        <HelperButtons>
          <StyledButton disabled={disabled} onClick={onChange}>
            {buttonText}
          </StyledButton>
        </HelperButtons>
      </HelperContainer>
    )
  }
}
