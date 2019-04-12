import * as React from "react";
import { findDOMNode } from "react-dom";

// TODO: Should blur child
// TODO: Should forward ref from parent perfect usecase for `React.forwardRef()`
interface ITouchOutsideProps {
  onChange: () => void;
  children: React.ReactNode;
}

export default function TouchOutside(props: ITouchOutsideProps): JSX.Element {
  const ref = React.useRef<HTMLDivElement>(null);
  const outsideHandleClick = ({ target }: MouseEvent): void => {
    const node = findDOMNode(ref.current);

    if (node instanceof HTMLElement) {
      if (!node.contains(target as any)) {
        props.onChange();
      }
    }
  };

  React.useEffect(() => {
    if (document) {
      document.addEventListener("touchstart", outsideHandleClick);
      document.addEventListener("click", outsideHandleClick);
    }

    return function cleanup() {
      if (document) {
        document.removeEventListener("touchstart", outsideHandleClick);
        document.removeEventListener("click", outsideHandleClick);
      }
    };
  }, []);

  return <div ref={ref}>{props.children}</div>;
}
