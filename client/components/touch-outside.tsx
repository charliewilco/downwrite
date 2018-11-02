import * as React from "react";
import { findDOMNode } from "react-dom";

// TODO: Should blur child
interface ITouchOutsideProps {
  onChange: () => void;
  children: React.ReactNode;
}

export default class TouchOutside extends React.Component<ITouchOutsideProps> {
  static displayName = "TouchOutside";

  componentDidMount() {
    if (document) {
      document.addEventListener("touchstart", this.outsideHandleClick);
      document.addEventListener("click", this.outsideHandleClick);
    }
  }

  componentWillUnmount() {
    if (document) {
      document.removeEventListener("touchstart", this.outsideHandleClick);
      document.removeEventListener("click", this.outsideHandleClick);
    }
  }

  outsideHandleClick = ({ target }): void => {
    const node = findDOMNode(this);

    if (node instanceof HTMLElement) {
      if (!node.contains(target)) {
        this.props.onChange();
      }
    }
  };

  render() {
    return <>{this.props.children}</>;
  }
}
