// @flow
import React, { Component } from 'react'
import styled from 'styled-components'
import { Toggle, Chevron, Button } from './'
import Media from 'react-media'

const HelperContainer = styled.div`
  @media (min-width: 950px) {
    float: right;
    margin-right: -208px;
    width: 192px;
  }
`

const HelperButtons = styled.div`
  display: flex;
  justify-content: ${({ spaced }) => (spaced ? 'space-between' : 'flex-end')};
  padding: 8px;
  @media (min-width: 950px) {
    padding: 0;
  }
`

const ChevronButton = styled.button`
  outline: 0;
  border: 0;
  appearance: none;
`

const HelperContent = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  justify-content: space-between;
  padding: 0 8px;

  @media (min-width: 950px) {
    justify-content: flex-start;
    padding: 0;
  }
`
const StyledButton = Button.extend`
  @media (min-width: 950px) {
    margin-bottom: 16px;
  }
`

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
      <Media query={{ minWidth: 950 }}>
        {match => (
          <Toggle defaultOpen={match}>
            {(open, toggle) => (
              <HelperContainer>
                <HelperButtons spaced={children}>
                  {!match &&
                    children && (
                      <ChevronButton onClick={toggle}>
                        <Chevron open={open} />
                      </ChevronButton>
                    )}
                  <StyledButton disabled={disabled} onClick={onChange}>
                    {buttonText}
                  </StyledButton>
                </HelperButtons>
                {(match || open) && <HelperContent>{children}</HelperContent>}
              </HelperContainer>
            )}
          </Toggle>
        )}
      </Media>
    )
  }
}
