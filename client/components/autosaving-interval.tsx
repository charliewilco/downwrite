import * as React from "react";
import delay from "delay";
// import debounce from "lodash/debounce";

interface IAutosavingProps {
  onUpdate: (x?: any) => void;
  delay: number;
  duration: number;
}

interface IAutosavingState {
  autosaving: boolean;
}

export default class AutosavingInterval extends React.Component<
  IAutosavingProps,
  IAutosavingState
> {
  state = { autosaving: false };

  static defaultProps = {
    onUpdate: () => null,
    delay: 3000,
    duration: 5000
  };

  isMounted: boolean = false;
  interval: any;

  componentDidMount() {
    this.isMounted = true;

    this.interval = setInterval(async () => {
      if (this.isMounted && this.props.onUpdate) {
        this.setState({ autosaving: true });
        await delay(this.props.delay);
        this.props.onUpdate();
        this.setState({ autosaving: false });
      }
    }, this.props.duration);
  }

  componentWillUnmount() {
    this.isMounted = false;
    clearInterval(this.interval);
  }

  render() {
    const { autosaving } = this.state;
    return autosaving && this.props.children;
  }
}
