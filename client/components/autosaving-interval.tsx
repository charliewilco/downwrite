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
  public readonly state = { autosaving: false };

  public static defaultProps = {
    onUpdate: () => {},
    delay: 3000,
    duration: 5000
  };

  private isMounted: boolean = false;
  private interval: any;

  public componentDidMount(): void {
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

  public componentWillUnmount(): void {
    this.isMounted = false;
    clearInterval(this.interval);
  }

  public render(): JSX.Element {
    const { autosaving } = this.state;
    if (autosaving) {
      return <>{this.props.children}</>;
    }

    return null;
  }
}
