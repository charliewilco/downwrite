import React from "react";
import styled, { keyframes } from "styled-components";

const backNForth = keyframes`
  0% {
    transform: translate(0, 0);
  }

  50% {
    transform: translate(calc(384px - 60px), 0);
  }

  100% {
    transform: translate(0, 0);
  }
`;

const NibContainer = styled.div`
  &::after {
    content: "";
    margin-top: 8px;
    width: 100%;
    height: 4px;
    display: block;
    background-image: linear-gradient(#4fa5c2, #185a70);
  }
`;

const AnimatedIcon = styled.svg`
  animation: ${backNForth} 7s infinite;
  width: 60px;
  height: 71px;
  display: block;
  transform: translate(0, 0);
`;

export default () => (
  <NibContainer>
    <AnimatedIcon viewBox="0 0 60 71">
      <title>Nib</title>
      <g id="Canvas" transform="translate(-353 36)">
        <g id="Nib">
          <g id="Shape">
            <use
              xlinkHref="#path0_fill"
              transform="matrix(0.866025 0.5 -0.5 0.866025 398.621 -27.8143)"
              fill="url(#paint0_radial)"
            />
          </g>
          <g id="Shape">
            <use
              xlinkHref="#path1_fill"
              transform="matrix(0.866025 0.5 -0.5 0.866025 384.765 -35.8143)"
              fill="url(#paint1_radial)"
            />
          </g>
        </g>
      </g>
      <defs>
        <radialGradient
          id="paint0_radial"
          cx="0.5"
          cy="0.5"
          r="0.5"
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(46.0248 0 0 179.743 -15.0124 -58.6288)">
          <stop offset="0" stopColor="#FFCE00" />
          <stop offset="0.1639" stopColor="#FFD600" />
          <stop offset="0.579" stopColor="#FFE600" />
          <stop offset="1" stopColor="#FFCE00" />
        </radialGradient>
        <radialGradient
          id="paint1_radial"
          cx="0.5"
          cy="0.5"
          r="0.5"
          gradientUnits="userSpaceOnUse"
          gradientTransform="matrix(46.0248 0 0 179.742 -15.0124 -58.6282)">
          <stop offset="0" stopColor="#FFB600" />
          <stop offset="0.5249" stopColor="#FFC200" />
          <stop offset="1" stopColor="#F4A903" />
        </radialGradient>
        <path
          id="path0_fill"
          fillRule="evenodd"
          d="M 0 0L 0 40.7006C 1.90351 40.7006 3.4466 42.2289 3.4466 44.1141C 3.4466 45.9993 1.90351 47.5276 0 47.5276L 0 62.4857L 16 47.29L 0 0L 0 0Z"
        />
        <path
          id="path1_fill"
          fillRule="evenodd"
          d="M 12.5534 44.1141C 12.5534 42.2289 14.0965 40.7006 16 40.7006L 16 0L 0 47.2896L 16 62.4853L 16 47.5272C 14.0965 47.5276 12.5534 45.9993 12.5534 44.1141L 12.5534 44.1141Z"
        />
      </defs>
    </AnimatedIcon>
  </NibContainer>
);
