// @flow

import React, { Component, type ComponentType } from 'react'
import styled, { injectGlobal } from 'styled-components'
import Checkbox from './checkbox'
import { colors } from '../utils/defaultStyles'

const NIGHT_MODE: string = 'NightMDX'

const NightContainer = styled.div`
  padding-top: 16px;
  position: relative;
  min-height: 100%;
`

const NightToggle = styled.div`
  color: ${colors.text};
  padding: 8px;
  margin: 32px;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.12);
  background: white;
  bottom: 0;
  z-index: 50;
  position: fixed;
`

const NightLabel = styled.small`
  margin-left: 8px;
`

const NightController = styled.label`
  display: flex;
  align-items: center;
`
// TODO: use color variables from utils instead of code smells and custom properties

injectGlobal`
  .NightMDX {
    background: ${colors.blue900};
  }

  .NightMode a {
    color: ${colors.yellow700};
  }

  .NightMode {
    transition: background 375ms ease-in-out;
    background: ${colors.blue900};
    color: ${colors.gray100};
  }

  .NightMode svg:not(.Chevron),
  .NightMode svg:not(.Chevron) path {
    fill: ${colors.blue400} !important;
  }

  .NightMode .PreviewBody blockquote,
  .NightMode blockquote {
    background: none;
    color: ${colors.blue100} !important;
  }
`

export default class NightModeContainer extends Component<
  { children: ComponentType<any> },
  { night: boolean }
> {
  static displayName = 'NightModeContainer'

  state = {
    night: false
  }

  componentDidMount() {
    let night = JSON.parse(localStorage.getItem('nightMode')) || false
    this.setState({ night })
  }

  setNightMode = (status: boolean) => {
    const { body } = document
    if (body instanceof HTMLElement) {
      localStorage.setItem('nightMode', status.toString())

      status ? body.classList.add(NIGHT_MODE) : body.classList.remove(NIGHT_MODE)
    }
  }

  componentDidUpdate() {
    const { night } = this.state
    this.setNightMode(night)
  }

  onChange = () => {
    this.setState(({ night }) => ({ night: !night }))
  }

  componentWillUnmount() {
    if (document.body) {
      document.body.classList.remove(NIGHT_MODE)
    }
  }

  render() {
    const { night } = this.state
    const { children } = this.props
    return (
      <NightContainer className={night ? 'NightMode' : ''}>
        <NightToggle>
          <NightController>
            <Checkbox checked={night} onChange={this.onChange} />
            <NightLabel>Night Mode</NightLabel>
          </NightController>
        </NightToggle>
        <div>{children}</div>
      </NightContainer>
    )
  }
}
