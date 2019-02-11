import * as React from "react";

export default class LockScroll extends React.Component {
  public componentDidMount(): void {
    if (document) {
      if (document.body) {
        document.body.classList.add("__noScroll");
      }
    }
  }

  public componentWillUnmount(): void {
    if (document) {
      if (document.body) {
        document.body.classList.remove("__noScroll");
      }
    }
  }

  public render(): React.ReactNode {
    return this.props.children;
  }
}
