import React from 'react'
import { Flex, Block } from 'glamor/jsxstyle'
import Check from './Checkbox'

const NIGHT_MODE = 'NightMDX'

export default class extends React.Component {
  state = {
    night: false
  }

  componentWillMount() {
    // TODO: there should be a better:
    const night = JSON.parse(localStorage.getItem('nightMode')) || false

    this.setState({ night: night }, () => {
      if (night && !this.containsClass()) {
        document.body.classList.add(NIGHT_MODE)
      }
    })
  }

  containsClass = () => document.body.classList.contains(NIGHT_MODE)

  setNight = status => {
    localStorage.setItem('nightMode', status)

    status
      ? document.body.classList.add(NIGHT_MODE)
      : document.body.classList.remove(NIGHT_MODE)
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
          position="fixed">
          <Flex alignItems="center" component="label">
            <Check checked={night} onChange={this.onChange} />
            <small style={{ marginLeft: 8 }}>Night Mode is {!night ? 'Off' : 'On'}</small>
          </Flex>
        </Block>
        <Block>{this.props.children}</Block>
      </Block>
    )
  }
}
