import * as React from "react";

interface IToggleAction {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSetInstance: (x: boolean) => void;
}

type ToggleRenderProps = (state: IToggleAction) => React.ReactNode;

interface ToggleProps {
  defaultOpen: boolean;
  children: ToggleRenderProps;
}

export default class ToggleInstance extends React.Component<
  ToggleProps,
  { open: boolean }
> {
  public static defaultProps = {
    defaultOpen: false
  };

  public static displayName = "ToggleInstance";

  public readonly state = {
    open: this.props.defaultOpen
  };

  private closeInstance = (): void => {
    this.setState({ open: false });
  };

  private setInstance = (value: boolean): void => {
    this.setState({ open: value });
  };

  private toggleInstance = (): void => {
    this.setState(({ open }) => ({ open: !open }));
  };

  public render() {
    return this.props.children({
      isOpen: this.state.open,
      onToggle: this.toggleInstance,
      onClose: this.closeInstance,
      onSetInstance: this.setInstance
    });
  }
}
