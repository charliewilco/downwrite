import * as React from "react";
import debounce from "lodash/debounce";

interface IDebounceProps {
  method?: () => void;
  timeout: number;
}

export default function Debouncer(props: IDebounceProps): null {
  if (props.method) {
    const autoFire = debounce(props.method, props.timeout || 3500);
    React.useEffect(() => {
      autoFire();
      return function cleanup() {
        autoFire.flush();
      };
    }, []);
  }

  return null;
}
