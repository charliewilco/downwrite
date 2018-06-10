import { Component } from 'react'

export default class extends Component {
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
    return this.props.children(
      this.state.open,
      this.toggleInstance,
      this.closeInstance
    )
  }
}
