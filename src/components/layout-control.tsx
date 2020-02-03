import * as React from "react";
import classNames from "../utils/classnames";
import { useSwitchProps } from "../hooks/toggle";

interface ILayoutControl {
  layout: boolean;
  layoutChange: (x: boolean) => void;
}

export default function LayoutControl({ layout, layoutChange }: ILayoutControl) {
  const { onClick, ...switchProps } = useSwitchProps(layout, "Grid or List Layout");

  const wrappedLayoutChange = React.useCallback(
    (val: boolean) => {
      onClick(val);
      layoutChange(val);
    },
    [onClick, layoutChange]
  );
  return (
    <div {...switchProps}>
      <div
        data-testid="LAYOUT_CONTROL_GRID"
        className={classNames("LayoutTrigger", layout && "active")}
        onClick={() => wrappedLayoutChange(true)}>
        Grid
      </div>
      <div
        className={classNames("LayoutTrigger", !layout && "active")}
        data-testid="LAYOUT_CONTROL_LIST"
        onClick={() => wrappedLayoutChange(false)}>
        List
      </div>
    </div>
  );
}
