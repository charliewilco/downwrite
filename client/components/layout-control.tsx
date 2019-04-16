import * as React from "react";
import classNames from "../utils/classnames";

interface ILayoutControl {
  layout: boolean;
  layoutChange: (x: boolean) => void;
}

export default function LayoutControl(props: ILayoutControl) {
  return (
    <div>
      <div
        data-testid="LAYOUT_CONTROL_GRID"
        className={classNames("LayoutTrigger", props.layout && "active")}
        onClick={() => props.layoutChange(true)}>
        Grid
      </div>
      <div
        className={classNames("LayoutTrigger", !props.layout && "active")}
        data-testid="LAYOUT_CONTROL_LIST"
        onClick={() => props.layoutChange(false)}>
        List
      </div>
    </div>
  );
}
