import * as React from "react";
import Check from "./checkbox";

interface ICheckboxToggle {
  value: boolean;
  name?: string;
  label: (value: boolean) => string;
  onChange: (e: React.ChangeEvent) => void;
}

export const ToggleBox: React.FC<ICheckboxToggle> = props => {
  const text = props.label(props.value);
  return (
    <div>
      <label>
        <Check name={props.name} checked={props.value} onChange={props.onChange} />
        <span>{text}</span>
      </label>
      <style jsx>{`
        div {
          margin-right: 16px;
        }

        span {
          flex: 1;
          margin-left: 8px;
          display: inline-block;
          vertical-align: middle;
          line-height: 1.2;
        }

        label {
          font-size: 12px;
          display: flex;
          align-items: center;
        }
      `}</style>
    </div>
  );
};
