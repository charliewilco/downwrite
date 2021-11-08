import { useMixedCheckbox } from "@reach/checkbox";
import { VisuallyHidden } from "@reach/visually-hidden";
import React, { useRef } from "react";

interface IVisibilityToggleProps {
  checked: boolean;
  onCheck(ev: React.ChangeEvent<HTMLInputElement>): void;
}

export const VisibilityToggle: React.FC<IVisibilityToggleProps> = ({
  checked,
  onCheck,
  children
}) => {
  let inputRef = useRef(null);
  let [inputProps, stateData] = useMixedCheckbox(inputRef, {
    checked,
    onChange: onCheck
  });

  return (
    <span>
      <VisuallyHidden>
        <input {...inputProps} ref={inputRef} />
      </VisuallyHidden>
      {children}
      <style jsx>{`
        span {
          display: flex;
          color: ${!!stateData.checked ? "var(--pixieblue-500)" : "var(--onyx-200)"};
        }
      `}</style>
    </span>
  );
};
