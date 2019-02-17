import * as React from "react";
import delay from "delay";

interface IAutosavingProps {
  onUpdate: (x?: any) => void;
  delay?: number;
  duration?: number;
}

const AutosavingInterval: React.FC<IAutosavingProps> = function(props) {
  const [autosaving, setAutoSaving] = React.useState<boolean>(false);

  let interval: NodeJS.Timeout;

  React.useEffect(() => {
    interval = setInterval(async () => {
      if (props.onUpdate) {
        setAutoSaving(true);
        await delay(props.delay || 3000);
        props.onUpdate();
        setAutoSaving(false);
      }
    }, props.duration || 5000);

    return function cleanup() {
      clearInterval(interval);
    };
  }, []);

  if (autosaving) {
    return <>{props.children}</>;
  }

  return null;
};

export default AutosavingInterval;
