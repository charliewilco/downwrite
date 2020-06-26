import { useMemo, useContext, useCallback, createContext } from "react";
import Checkbox from "./checkbox";
import { useDarkModeEffect, DarkModeVals } from "../hooks";
import classNames from "../utils/classnames";

export interface INightModeContext {
  night: boolean;
  action: {
    onChange: () => void;
  };
}

export const NightModeContext = createContext<INightModeContext>({
  night: false,
  action: {
    onChange() {}
  }
});

interface INightModeContainerProps extends React.PropsWithChildren<{}> {}

function useNightModeContext(): INightModeContext {
  const [night, onChange] = useDarkModeEffect(DarkModeVals.NIGHT_MODE);

  const getContext = useCallback((): INightModeContext => {
    return {
      night,
      action: { onChange }
    };
  }, [night, onChange]);

  return useMemo<INightModeContext>(() => getContext(), [getContext]);
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
  const { night, action } = useContext<INightModeContext>(NightModeContext);
  const onChange = () => {
    action.onChange();
  };

  const cx = classNames("NightModeTrigger", night && "NightMode");

  return (
    <div className={cx}>
      <form className="NightToggle" tabIndex={-1} onSubmit={onChange}>
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
