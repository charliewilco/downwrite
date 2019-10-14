import * as React from "react";
import Checkbox from "./checkbox";
import useDarkModeEffect, { DarkModeVals } from "../hooks/dark-mode";
import classNames from "../utils/classnames";

export interface INightModeContext {
  night: boolean;
  action: {
    onChange: () => void;
  };
}

export const NightModeContext = React.createContext({} as INightModeContext);

interface INightModeContainerProps extends React.PropsWithChildren<{}> {}

function useNightModeContext(): INightModeContext {
  const [night, onChange] = useDarkModeEffect(DarkModeVals.NIGHT_MODE);

  function getContext(): INightModeContext {
    return {
      night,
      action: { onChange }
    };
  }

  return React.useMemo<INightModeContext>(() => getContext(), [night]);
}

export default function NightModeContainer(
  props: INightModeContainerProps
): JSX.Element {
  const context = useNightModeContext();
  return (
    <NightModeContext.Provider value={context}>
      {props.children}
    </NightModeContext.Provider>
  );
}

// TODO: Remove
export function NightModeTrigger(props: INightModeContainerProps): JSX.Element {
  const { night, action } = React.useContext<INightModeContext>(NightModeContext);
  const onChange = () => {
    action.onChange();
  };

  const cx = classNames("NightModeTrigger", night && "NightMode");

  return (
    <div className={cx}>
      <form className="NightToggle" role="form" tabIndex={-1} onSubmit={onChange}>
        <label className="NightController" htmlFor="nightToggle">
          <Checkbox
            role="checkbox"
            aria-checked={night}
            checked={night}
            id="nightToggle"
            onChange={onChange}
          />
          <small className="NightLabel">Night Mode</small>
        </label>
      </form>
      {props.children}
    </div>
  );
}
