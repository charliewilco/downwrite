import * as React from "react";
import classNames from "../utils/classnames";
import { useSwitchProps } from "../hooks/toggle";

interface ILayoutControl {
  layout: boolean;
  layoutChange: (x: boolean) => void;
}

export default function LayoutControl(props: ILayoutControl) {
  const { onClick, ...switchProps } = useSwitchProps(
    props.layout,
    "Grid or List Layout"
  );

  React.useEffect(
    function() {
      props.layoutChange(switchProps["aria-checked"]);
    },
    [switchProps["aria-checked"]]
  );

  return (
    <div {...switchProps}>
      <div
        data-testid="LAYOUT_CONTROL_GRID"
        className={classNames("LayoutTrigger", props.layout && "active")}
        onClick={() => onClick(true)}>
        Grid
      </div>
      <div
        className={classNames("LayoutTrigger", !props.layout && "active")}
        data-testid="LAYOUT_CONTROL_LIST"
        onClick={() => onClick(false)}>
        List
      </div>
    </div>
  );
}
