import * as React from "react";

interface IToggleAction {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSetInstance: (x: boolean) => void;
}

interface ToggleProps {
  defaultOpen: boolean;
  children: (state: IToggleAction) => React.ReactNode;
}

export default class ToggleInstance extends React.Component<
  ToggleProps,
  { open: boolean }
> {
  static defaultProps = {
    defaultOpen: false
  };

  static displayName = "ToggleInstance";

  state = {
    open: this.props.defaultOpen
  };

  closeInstance = () => this.setState({ open: false });

  setInstance = (value: boolean) => this.setState({ open: value });

  toggleInstance = () => this.setState(({ open }) => ({ open: !open }));

  render() {
    return this.props.children({
      isOpen: this.state.open,
      onToggle: this.toggleInstance,
      onClose: this.closeInstance,
      onSetInstance: this.setInstance
    });
  }
}
