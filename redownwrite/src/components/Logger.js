import React, { Component } from 'react'
import __IS_DEV__ from '../utils/dev'
import Null from './Null'

export default class Logger extends Component {
  static defaultProps = {
    type: 'log',
    clear: false
  }

  logger = console[this.props.type]

  componentDidMount() {
    if (__IS_DEV__) {
      const { value } = this.props
      this.logger(value)
    }
  }

  componentWillReceiveProps({ value, clear }) {
    if (__IS_DEV__) {
      this.logger(value)

      clear && console.clear()
    }
  }

  render() {
    return <Null />
  }
}
