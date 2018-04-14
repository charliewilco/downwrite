import React, { Component } from 'react'
import styled from 'styled-components'

const StyledInput = styled.input`
  display: block;
  width: 100%;
  appearance: none;
  font-weight: 700;
  font-size: 125%;
  border-width: 0px;
  border-bottom: 1px;
  border-style: solid;
  border-radius: 0px;
  border-color: rgba(0, 0, 0, 0.125);
  padding-left: 0px;
  padding-right: 0px;
  padding-top: 8px;
  padding-bottom: 8px;
`

export default class Input extends Component {
  static defaultProps = {
    type: 'text'
  }

  render() {
    const { onChange, type, inputRef, ...args } = this.props

    return <StyledInput ref={inputRef} onChange={onChange} {...args} />
  }
}
