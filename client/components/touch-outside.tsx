import * as React from "react";
import { findDOMNode } from "react-dom";

// TODO: Should blur child
interface ITouchOutsideProps {
  onChange: () => void;
  children: React.ReactNode;
}

export default class TouchOutside extends React.Component<ITouchOutsideProps> {
  public static displayName = "TouchOutside";

  public componentDidMount(): void {
    if (document) {
      document.addEventListener("touchstart", this.outsideHandleClick);
      document.addEventListener("click", this.outsideHandleClick);
    }
  }

  public componentWillUnmount(): void {
    if (document) {
      document.removeEventListener("touchstart", this.outsideHandleClick);
      document.removeEventListener("click", this.outsideHandleClick);
    }
  }

  private outsideHandleClick = ({ target }: MouseEvent): void => {
    const node = findDOMNode(this);

    if (node instanceof HTMLElement) {
      if (!node.contains(target as any)) {
        this.props.onChange();
      }
    }
  };

  public render(): JSX.Element {
    return <>{this.props.children}</>;
  }
}
