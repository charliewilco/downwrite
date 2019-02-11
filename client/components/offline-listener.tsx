import * as React from "react";

interface OfflineAtrx {
  offline: boolean;
}

export const { Provider, Consumer } = React.createContext({});

export default class OfflineListener extends React.Component<
  { children: React.ReactNode },
  OfflineAtrx
> {
  public static displayName = "OfflineListener";

  public readonly state = {
    offline: !window.navigator.onLine
  };

  private handleChange = (x: Event): void => {
    this.setState({
      offline: !(x.currentTarget as Window).navigator.onLine
    });
  };

  public componentDidMount(): void {
    if (window) {
      window.addEventListener("offline", this.handleChange);
      window.addEventListener("online", this.handleChange);
    }
  }

  public componentWillUnmount(): void {
    if (window) {
      window.removeEventListener("offline", this.handleChange);
      window.removeEventListener("online", this.handleChange);
    }
  }

  public render(): JSX.Element {
    const { offline } = this.state;
    const { children } = this.props;
    return <Provider value={{ offline }}>{children}</Provider>;
  }
}
