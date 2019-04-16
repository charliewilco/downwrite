import * as React from "react";
import Check from "./checkbox";

interface ICheckboxToggle {
  value: boolean;
  name?: string;
  label: (value: boolean) => string;
  onChange: (e: React.ChangeEvent) => void;
}

export function ToggleBox(props: ICheckboxToggle) {
  const text = props.label(props.value);
  return (
    <div className="ToggleBox">
      <label className="ToggleBoxInner">
        <Check name={props.name} checked={props.value} onChange={props.onChange} />
        <span className="ToggleBoxLabel">{text}</span>
      </label>
    </div>
  );
}
