import classNames from "../utils/classnames";

interface ILayoutControl {
  layout: boolean;
  layoutChange: (x: boolean) => void;
}

export const LayoutControl: React.VFC<ILayoutControl> = (props) => {
  return (
    <div
      role="switch"
      aria-label="Grid or List Layout"
      aria-checked={props.layout}
      className="switch">
      <div
        data-testid="LAYOUT_CONTROL_GRID"
        className={classNames("toggleButton", props.layout && "active")}
        onClick={() => props.layoutChange(true)}>
        Grid
      </div>
      <div
        className={classNames("toggleButton", !props.layout && "active")}
        data-testid="LAYOUT_CONTROL_LIST"
        onClick={() => props.layoutChange(false)}>
        List
      </div>
      <style jsx>{`
        .switch {
          display: flex;
        }

        .toggleButton {
          flex: 1;
          opacity: 50%;
          border-bottom: 4px solid transparent;
          cursor: pointer;
          font-weight: bold;
        }

        .toggleButton.active {
          opacity: 100%;
          border-bottom-color: #2597f1;
        }
      `}</style>
    </div>
  );
};
