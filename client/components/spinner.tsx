import * as React from 'react';
import styled, { css, keyframes } from 'styled-components';

let ripple = keyframes`
  0% {
    transform: ${`scale(0.1)`};
    opacity: 1;
  }

  70% {
    transform: ${`scale(1)`};
    opacity: 0.7;
  }

  100% {
    opacity: 0;
  }
`;

let spinners = (size: number) => css`
  position: absolute;
  top: ${-2}px;
  left: ${size / -2 + 1}px;
  width: ${size}px;
  height: ${size}px;
  border-radius: ${`100%`};
  border: 2px solid currentColor;
  animation-fill-mode: both;
  animation: ${ripple} 1.25s 0s infinite cubic-bezier(0.21, 0.53, 0.56, 0.8);
`;

const OuterRing = styled.div`
  position: relative;
  margin: auto;
  color: ${(props: ISpinnerProps) => props.color};
  transform: translateY(${(props: ISpinnerProps) => props.size / 2}px);
`;

const InnerRing = styled.div`
  ${(props: ISpinnerProps) => spinners(props.size)};
  animation-delay: ${props => props.delay};
`;

interface ISpinnerProps {
  size: number;
  color?: string;
  delay?: string;
}

const Spinner: React.SFC<ISpinnerProps> = ({ size, color }) => (
  <OuterRing size={size} color={color}>
    <InnerRing size={size} delay="-0.6s" />
    <InnerRing size={size} delay="-0.4s" />
    <InnerRing size={size} delay="-0.2s" />
  </OuterRing>
);

export default Spinner;
