// @flow
import React, { Component } from 'react'
import Null from './Null'

export default class OfflineListener extends Component<{ onChange: Function }, void> {
  componentDidMount() {
    window.addEventListener('offline', this.handleChange)
    window.addEventListener('online', this.handleChange)
  }

  handleChange = (x: Event) => this.props.onChange(!x.currentTarget.navigator.onLine)

  componentWillUnmount() {
    window.removeEventListener('offline', this.handleChange)
    window.removeEventListener('online', this.handleChange)
  }

  render() {
    return <Null />
  }
}
