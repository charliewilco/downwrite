import * as React from "react";
import Spinner from "./spinner";
import * as DefaultStyles from "../utils/defaultStyles";

interface ILoadingProps {
  size: number;
}

const Loading: React.FC<ILoadingProps> = props => (
  <div className="loading" data-testid="LOADING_SPINNER">
    <Spinner size={props.size} color={DefaultStyles.colors.blue400} />
    <style jsx>{`
      .loading {
        display: flex;
        justify-content: center;
        flex-direction: column;
        align-items: center;
        position: relative;
        height: calc(100% - ${props.size}px);
      }
    `}</style>
  </div>
);

Loading.defaultProps = {
  size: 75
};

export default Loading;
