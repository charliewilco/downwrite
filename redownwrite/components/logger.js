/* eslint-disable no-console */

import React, { Component } from 'react'
import { __IS_DEV__ } from '../utils/dev'
import Null from './Null'

export default class Logger extends Component {
  static defaultProps = {
    type: 'log',
    clear: false
  }

  logger = console[this.props.type]

  componentDidMount() {
    if (__IS_DEV__) {
      this.logger(this.props.value)
    }
  }

  componentDidUpdate() {
    if (__IS_DEV__) {
      this.logger(this.props.value)

      this.props.clear && console.clear()
    }
  }

  render() {
    return <Null />
  }
}
