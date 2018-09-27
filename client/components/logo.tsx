import * as React from 'react';
import styled from 'styled-components';

const LogoContainer = styled.div`
  max-width: 20px;

  @media (min-width: 57.75rem) {
    max-width: 33px;
  }
`;

const LogoVector = styled.svg`
  display: block;
  max-width: 100%;
  min-height: auto;
`;

const LogoMark = () => (
  <LogoVector width={33} height={50} viewBox="0 0 33 50">
    <title>Downwrite Logo</title>
    <defs>
      <radialGradient fx="50%" fy="50%" r="143.827%" id="a">
        <stop stopColor="#FFCE00" offset="0%" />
        <stop stopColor="#FFD600" offset="16.39%" />
        <stop stopColor="#FFE600" offset="57.9%" />
        <stop stopColor="#FFCE00" offset="100%" />
      </radialGradient>
      <radialGradient fx="50%" fy="50%" r="143.827%" id="b">
        <stop stopColor="#FFB600" offset="0%" />
        <stop stopColor="#FFC200" offset="52.49%" />
        <stop stopColor="#F4A903" offset="100%" />
      </radialGradient>
    </defs>
    <g fill="none" fillRule="evenodd">
      <path
        d="M16.469 5.275V30.97c1.202 0 2.176.965 2.176 2.155s-.974 2.155-2.176 2.155v9.444l10.101-9.594L16.47 5.275z"
        fill="url(#a)"
      />
      <path
        d="M14.293 33.126c0-1.19.974-2.155 2.176-2.155V5.275L6.367 35.13l10.102 9.594v-9.444a2.165 2.165 0 0 1-2.176-2.155z"
        fill="url(#b)"
      />
      <path
        d="M32.938 50H0V0h32.938v50zM1.63 48.47h29.677V1.53H1.63v46.94z"
        fill="#FFC200"
      />
    </g>
  </LogoVector>
);

const Logo: React.SFC<any> = () => (
  <LogoContainer>
    <LogoMark />
  </LogoContainer>
);

export default Logo;
