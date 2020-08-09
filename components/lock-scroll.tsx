import * as React from "react";

const LOCK_SCROLL_CLASSNAME: string = "__noScroll";

interface ILockScrollProps {
  children: React.ReactNode;
}

export default function LockScroll(props: ILockScrollProps): JSX.Element {
  React.useEffect(() => {
    if (document) {
      if (document.body) {
        document.body.classList.add(LOCK_SCROLL_CLASSNAME);
      }
    }

    return function cleanup() {
      if (document) {
        if (document.body) {
          document.body.classList.remove(LOCK_SCROLL_CLASSNAME);
        }
      }
    };
  }, []);

  return <>{props.children}</>;
}
