import * as React from "react";
import Spinner from "./spinner";
import * as DefaultStyles from "../utils/defaultStyles";

interface ILoadingProps {
  size: number;
}

export default function Loading(props: ILoadingProps): JSX.Element {
  return (
    <div className="loading" data-testid="LOADING_SPINNER">
      <Spinner size={props.size || 75} color={DefaultStyles.colors.blue400} />
      <style jsx>{`
        .loading {
          display: flex;
          justify-content: center;
          flex-direction: column;
          align-items: center;
          position: relative;
          height: calc(100% - ${props.size || 75}px);
        }
      `}</style>
    </div>
  );
}
