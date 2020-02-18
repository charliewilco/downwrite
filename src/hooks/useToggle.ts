import * as React from "react";

interface IBaseA11ySwitchProps {
  label?: string;
  role: string;
  "aria-label": string;
  "aria-checked": boolean;
  onClick: (v: boolean) => void;
}

interface IToggleDispatches {
  onToggle: () => void;
  onSetInstance: (v: boolean) => void;
}

export function useToggle(defaultValue?: boolean): [boolean, IToggleDispatches] {
  const [open, setOpen] = React.useState<boolean>(defaultValue || false);

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

export function useSwitchProps(
  defaultValue?: boolean,
  label?: string
): IBaseA11ySwitchProps {
  const [state, { onSetInstance }] = useToggle(defaultValue);
  return {
    role: "switch",
    "aria-label": label,
    "aria-checked": state,
    onClick: (v: boolean) => {
      onSetInstance(v);
    }
  };
}
