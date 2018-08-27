// @flow
import React, { Component } from 'react'
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

export default class extends Component<{
  children?: Node,
  disabled: boolean,
  onChange: Function,
  buttonText: string
}> {
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
