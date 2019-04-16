import * as React from "react";

export default function usePrevious<T>(value: T): T {
  const ref = React.useRef<T>(null);
  React.useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}
