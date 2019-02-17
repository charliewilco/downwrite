import * as React from "react";
import debounce from "lodash/debounce";

interface DebounceProps {
  method?: () => void;
  timeout: number;
}

const Debouncer: React.FC<DebounceProps> = function(props) {
  if (props.method) {
    const autoFire = debounce(props.method, props.timeout);
    React.useEffect(() => {
      autoFire();
      return function cleanup() {
        autoFire.flush();
      };
    }, []);
  }

  return null;
};

Debouncer.defaultProps = {
  timeout: 3500
};

export default Debouncer;
