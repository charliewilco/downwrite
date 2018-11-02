import * as React from "react";
import debounce from "lodash/debounce";

interface DebounceProps {
  method: () => void;
  timeout: number;
}

export default class extends React.Component<DebounceProps> {
  static displayName = "Debouncer";

  static defaultProps = {
    method: () => {},
    timeout: 3500
  };

  autoFire = debounce(this.props.method, this.props.timeout);

  componentDidMount() {
    this.autoFire();
  }

  componentWillUnmount() {
    this.autoFire.flush();
  }

  render() {
    return null;
  }
}
