import * as React from "react";

export default function useToggle(
  defaultState: boolean
): [
  boolean,
  {
    onToggle: () => void;
    onSetInstance: (v: boolean) => void;
  }
] {
  const [open, setOpen] = React.useState<boolean>(defaultState || false);

  const onToggle = (): void => {
    setOpen(prev => !prev);
  };

  const setInstance = (value: boolean): void => {
    setOpen(value);
  };

  return [
    open,
    {
      onToggle,
      onSetInstance: setInstance
    }
  ];
}
