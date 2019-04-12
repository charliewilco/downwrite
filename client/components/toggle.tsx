import * as React from "react";

interface IToggleAction {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onSetInstance: (x: boolean) => void;
}

interface ToggleProps {
  defaultOpen?: boolean;
  children(state: IToggleAction): React.ReactNode;
}

export default function Toggle(props: ToggleProps) {
  const [open, setOpen] = React.useState<boolean>(props.defaultOpen || false);
  const onClose = () => {
    setOpen(false);
  };

  const setInstance = (value: boolean) => {
    setOpen(value);
  };

  const onToggle = () => {
    setOpen(prev => !prev);
  };

  return (
    <>
      {props.children({
        isOpen: open,
        onToggle,
        onClose,
        onSetInstance: setInstance
      })}
    </>
  );
}
