import { useCallback } from "react";
import classNames from "../utils/classnames";
import { useSwitchProps } from "../hooks";

interface ILayoutControl {
  layout: boolean;
  layoutChange: (x: boolean) => void;
}

export default function LayoutControl({ layout, layoutChange }: ILayoutControl) {
  const { onClick, ...switchProps } = useSwitchProps(layout, "Grid or List Layout");

  const defaultClassName =
    "inline-block text-sm my-2 ml-4 border-b-4 opacity-50 border-transparent py-2 cursor-pointer";
  const activeClassName = "border-pixieblue-500 opacity-100";

  const wrappedLayoutChange = useCallback(
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
        className={classNames(defaultClassName, layout && activeClassName)}
        onClick={() => wrappedLayoutChange(true)}>
        Grid
      </div>
      <div
        className={classNames(defaultClassName, !layout && activeClassName)}
        data-testid="LAYOUT_CONTROL_LIST"
        onClick={() => wrappedLayoutChange(false)}>
        List
      </div>
    </div>
  );
}
