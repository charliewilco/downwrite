import * as React from "react";

interface OfflineAtrx {
  offline: boolean;
}

export const { Provider, Consumer } = React.createContext({});

export default class OfflineListener extends React.Component<
  { children: React.ReactNode },
  OfflineAtrx
> {
  static displayName = "OfflineListener";

  state = {
    offline: !window.navigator.onLine
  };

  handleChange = (x: Event) =>
    this.setState({
      offline: !(x.currentTarget as Window).navigator.onLine
    });

  componentDidMount() {
    if (window) {
      window.addEventListener("offline", this.handleChange);
      window.addEventListener("online", this.handleChange);
    }
  }

  componentWillUnmount() {
    if (window) {
      window.removeEventListener("offline", this.handleChange);
      window.removeEventListener("online", this.handleChange);
    }
  }

  render() {
    const { offline } = this.state;
    const { children } = this.props;
    return <Provider value={{ offline }}>{children}</Provider>;
  }
}
