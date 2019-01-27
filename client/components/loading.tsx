import * as React from "react";
import styled from "styled-components";
import Spinner from "./spinner";
import * as DefaultStyles from "../utils/defaultStyles";

interface ILoadingProps {
  size: number;
}

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  position: relative;
  height: calc(100% - ${(props: ILoadingProps) => props.size}px);
`;

const Loading: React.FC<ILoadingProps> = ({ size }) => (
  <LoadingContainer size={size} data-testid="LOADING_SPINNER">
    <Spinner size={size} color={DefaultStyles.colors.blue400} />
  </LoadingContainer>
);

Loading.defaultProps = {
  size: 75
};

export default Loading;
