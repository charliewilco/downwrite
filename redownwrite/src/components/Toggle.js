// @flow
import { Component } from 'react'

type ToggleState = {
  open: boolean
}

type ToggleProps = {
  defaultOpen: boolean,
  children: Function
}

export default class extends Component<ToggleProps, ToggleState> {
  static defaultProps = {
    defaultOpen: false
  }

  static displayName = 'ToggleInstance'

  state = {
    open: this.props.defaultOpen
  }

  closeInstance = () => this.setState({ open: false })

  toggleInstance = () => this.setState(({ open }) => ({ open: !open }))

  render() {
    return this.props.children(this.state.open, this.toggleInstance, this.closeInstance)
  }
}
