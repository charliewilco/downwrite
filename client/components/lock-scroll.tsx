import * as React from "react";

const LOCK_SCROLL_CLASSNAME: string = "__noScroll";

const LockScroll: React.FC = function(props) {
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
};

export default LockScroll;
