// @flow
import { Component } from 'react'

type ToggleState = {
  open: boolean
}

type ToggleProps = {
  defaultOpen: boolean
}

export default class extends Component<ToggleProps, ToggleState> {
  static defaultProps = {
    defaultOpen: false
  }

  static displayName = 'ToggleFaC'

  state = {
    open: this.props.defaultOpen
  }

  close = () => this.setState({ open: false })

  toggle = () => this.setState(({ open }) => ({ open: !open }))

  render() {
    return this.props.children(this.state.open, this.toggle, this.close)
  }
}
