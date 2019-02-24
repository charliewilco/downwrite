import * as React from "react";
import * as DefaultStyles from "../utils/defaultStyles";
import classNames from "../utils/classnames";

interface ILayoutControl {
  layout: boolean;
  layoutChange: (x: boolean) => void;
}

const LayoutControl: React.FC<ILayoutControl> = function(props) {
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
      <style jsx>{`
        .LayoutTrigger {
          display: inline-block;
          margin: 8px 0 8px 16px;
          cursor: pointer;
          font-size: 14px;
          font-family: ${DefaultStyles.fonts.sans};
          color: inherit;
          opacity: 0.5;
        }

        .LayoutTrigger::after {
          content: "";
          display: block;
          border-bottom: 3px solid transparent;
        }

        .LayoutTrigger.active {
          opacity: 1;
        }

        .LayoutTrigger.active::after {
          content: "";
          display: block;
          border-bottom: 3px solid var(--link);
        }
      `}</style>
    </div>
  );
};

export default LayoutControl;
