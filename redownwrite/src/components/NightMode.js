// @flow

import React, { Component, type ComponentType } from 'react'
import { Flex, Block } from 'glamor/jsxstyle'
import Check from './Checkbox'

const NIGHT_MODE: string = 'NightMDX'

let nightMode: boolean = JSON.parse(localStorage.getItem('nightMode'))

export default class extends Component<{ children: ComponentType<any> }, { night: boolean }> {
  state = {
    night: nightMode || false
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
      <Block
        className={night ? 'NightMode' : ''}
        minHeight="100%"
        position="relative"
        paddingTop={16}>
        <Block
          color="var(--text)"
          padding={8}
          margin={16 * 2}
          boxShadow="0 0 2px rgba(0,0,0,.07), 0 2px 4px rgba(0,0,0,.12)"
          background="white"
          bottom={0}
          zIndex={50}
          position="fixed">
          <Flex alignItems="center" component="label">
            <Check checked={night} onChange={this.onChange} />
            <small style={{ marginLeft: 8 }}>Night Mode</small>
          </Flex>
        </Block>
        <Block>{children}</Block>
      </Block>
    )
  }
}
