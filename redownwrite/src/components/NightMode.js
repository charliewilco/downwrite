// @flow

import React, { Component, type ComponentType } from 'react'
import styled, { injectGlobal } from 'styled-components'
import Check from './Checkbox'

const NIGHT_MODE: string = 'NightMDX'

const NightContainer = styled.div`
  padding-top: 16px;
  position: relative;
  min-height: 100%;
`

const NightToggle = styled.div`
  color: var(--text);
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
    background: #1f5671;
  }

  .NightMode a {
    color: var(--color-6);
  }

  .NightMode {
    transition: background 375ms ease-in-out;
    background: #1f5671;
    color: var(--color-4);
  }

  .NightMode svg:not(.Chevron),
  .NightMode svg:not(.Chevron) path {
    fill: var(--color-1) !important;
  }

  .NightMode .PreviewBody blockquote,
  .NightMode blockquote {
    background: none;
    color: var(--color-3) !important;
  }
`

export default class extends Component<{ children: ComponentType<any> }, { night: boolean }> {
  state = {
    night: JSON.parse(localStorage.getItem('nightMode')) || false
  }

  // TODO: Remove
  // TODO: Move to Theme
  // componentWillMount() {
  //   // TODO: there should be a better:
  //   const night = JSON.parse(localStorage.getItem('nightMode')) || false
  //
  //   this.setState({ night: night }, () => {
  //     if (night && !this.containsClass()) {
  //       document.body.classList.add(NIGHT_MODE)
  //     }
  //   })
  // }

  setNight = (status: boolean) => {
    const { body } = document
    if (body instanceof HTMLElement) {
      localStorage.setItem('nightMode', status.toString())

      status ? body.classList.add(NIGHT_MODE) : body.classList.remove(NIGHT_MODE)
    }
  }

  onChange = () => {
    this.setState(({ night }) => {
      this.setNight(!night)
      return { night: !night }
    })
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
            <Check checked={night} onChange={this.onChange} />
            <NightLabel>Night Mode</NightLabel>
          </NightController>
        </NightToggle>
        <div>{children}</div>
      </NightContainer>
    )
  }
}
