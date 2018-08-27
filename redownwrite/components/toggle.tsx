import * as React from 'react'

interface ToggleProps {
  defaultOpen: boolean,
  children: (a, b, c, d) => React.ReactNode
}

export default class ToggleInstance extends React.Component<ToggleProps, { open: boolean }> {
  static defaultProps = {
    defaultOpen: false
  }

  static displayName = 'ToggleInstance'

  state = {
    open: this.props.defaultOpen
  }

  closeInstance = () => this.setState({ open: false })

  setInstance = (value: boolean) => this.setState({ open: value })

  toggleInstance = () => this.setState(({ open }) => ({ open: !open }))

  render() {
    return this.props.children(
      this.state.open,
      this.toggleInstance,
      this.closeInstance,
      this.setInstance
    )
  }
}
