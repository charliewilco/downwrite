// @flow

import { Component, type Element } from 'react'
import debounce from 'lodash/debounce'

type DebounceProps = {
  method: Function,
  timeout: number,
  children: Element<*>
}

export default class extends Component<DebounceProps> {
  static displayName = 'Debouncer'

  static defaultProps = {
    method: () => {},
    timeout: 3500
  }

  autoFire = debounce(this.props.method, this.props.timeout)

  componentDidMount() {
    this.autoFire()
  }

  componentWillUnmount() {
    this.autoFire.flush()
  }

  render() {
    return this.props.children
  }
}
