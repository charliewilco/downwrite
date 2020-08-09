import * as React from "react";

type Callback = () => void;

export default function useTimeout(interval: number = 500, cb: Callback): void {
  React.useEffect(() => {
    const t = setTimeout(() => {
      cb();
    }, interval);

    return function cleanup() {
      clearTimeout(t);
    };
  }, []);
}
