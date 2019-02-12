import * as React from "react";
import debounce from "lodash/debounce";

interface DebounceProps {
  method: () => void;
  timeout: number;
}

export default class Debouncer extends React.Component<DebounceProps> {
  public static displayName = "Debouncer";

  public static defaultProps = {
    method: () => {},
    timeout: 3500
  };

  private autoFire = debounce(this.props.method, this.props.timeout);

  public componentDidMount(): void {
    this.autoFire();
  }

  public componentWillUnmount(): void {
    this.autoFire.flush();
  }

  public render(): null {
    return null;
  }
}
