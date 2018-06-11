// @flow
import React, { Component, createContext, type ElementType } from 'react'

type OfflineAtrx = {
  offline: boolean
}

export const { Provider, Consumer } = createContext()

export default class OfflineListener extends Component<
  { children: ElementType },
  OfflineAtrx
> {
  static displayName = 'OfflineListener'

  state = {
    offline: !window.navigator.onLine
  }

  handleChange = (x: SyntheticInputEvent<*>) =>
    this.setState({
      offline: !x.currentTarget.navigator.onLine
    })

  componentDidMount() {
    if (window) {
      window.addEventListener('offline', this.handleChange)
      window.addEventListener('online', this.handleChange)
    }
  }

  componentWillUnmount() {
    if (window) {
      window.removeEventListener('offline', this.handleChange)
      window.removeEventListener('online', this.handleChange)
    }
  }

  render() {
    const { offline } = this.state
    const { children } = this.props
    return <Provider value={{ offline }} children={children} />
  }
}
