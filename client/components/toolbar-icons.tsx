import * as React from "react";
import styled from "styled-components";

const Span = styled.span`
  display: inline-block;
`;

type Active = (x: boolean) => string;

export const activeStyle: Active = active => (active ? "#2584A5" : "#A9C2CA");

interface IToolbarIcons {
  active: boolean;
}

export const BlockQuote: React.SFC<IToolbarIcons> = ({ active }) => (
  <svg width="14px" height="10px" viewBox="0 0 14 10">
    <desc>Blockquote</desc>
    <defs />
    <g id="Views" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g id="Artboard" transform="translate(-281.000000, -126.000000)">
        <g id="Group-4" transform="translate(276.000000, 119.000000)">
          <path
            d="M6,17 L9,17 L11,13 L11,7 L5,7 L5,13 L8,13 L6,17 Z M14,17 L17,17 L19,13 L19,7 L13,7 L13,13 L16,13 L14,17 Z"
            id="Shape"
            fill={activeStyle(active)}
            fillRule="nonzero"
          />
          <polygon id="Shape" points="0 0 24 0 24 24 0 24" />
        </g>
      </g>
    </g>
  </svg>
);

export const BulletedList: React.SFC<IToolbarIcons> = ({ active }) => (
  <svg width="18px" height="10px" viewBox="0 0 18 10">
    <desc>Unordred List</desc>
    <defs />
    <g id="Views" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g id="Artboard" transform="translate(-314.000000, -126.000000)">
        <g id="Group-3" transform="translate(311.000000, 119.000000)">
          <path
            d="M3,13 L5,13 L5,11 L3,11 L3,13 Z M3,17 L5,17 L5,15 L3,15 L3,17 Z M3,9 L5,9 L5,7 L3,7 L3,9 Z M7,13 L21,13 L21,11 L7,11 L7,13 Z M7,17 L21,17 L21,15 L7,15 L7,17 Z M7,7 L7,9 L21,9 L21,7 L7,7 Z"
            id="Shape"
            fill={activeStyle(active)}
            fillRule="nonzero"
          />
          <polygon id="Shape" points="0 0 24 0 24 24 0 24" />
        </g>
      </g>
    </g>
  </svg>
);

export const Numbers: React.SFC<IToolbarIcons> = ({ active }) => (
  <svg width="19px" height="16px" viewBox="0 0 19 16">
    <desc>Numbers</desc>
    <defs />
    <g id="Views" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g id="Artboard" transform="translate(-348.000000, -123.000000)">
        <g id="Group-2" transform="translate(346.000000, 119.000000)">
          <path
            d="M2,17 L4,17 L4,17.5 L3,17.5 L3,18.5 L4,18.5 L4,19 L2,19 L2,20 L5,20 L5,16 L2,16 L2,17 Z M3,8 L4,8 L4,4 L2,4 L2,5 L3,5 L3,8 Z M2,11 L3.8,11 L2,13.1 L2,14 L5,14 L5,13 L3.2,13 L5,10.9 L5,10 L2,10 L2,11 Z M7,5 L7,7 L21,7 L21,5 L7,5 Z M7,19 L21,19 L21,17 L7,17 L7,19 Z M7,13 L21,13 L21,11 L7,11 L7,13 Z"
            id="Shape"
            fill={activeStyle(active)}
            fillRule="nonzero"
          />
          <polygon id="Shape" points="0 0 24 0 24 24 0 24" />
        </g>
      </g>
    </g>
  </svg>
);

export const Code: React.SFC<IToolbarIcons> = ({ active }) => (
  <svg width="20px" height="12px" viewBox="0 0 20 12">
    <desc>Code</desc>
    <defs />
    <g id="Views" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g id="Artboard" transform="translate(-383.000000, -125.000000)">
        <g id="Group" transform="translate(381.000000, 119.000000)">
          <polygon id="Shape" points="0 0 24 0 24 24 0 24" />
          <path
            d="M9.4,16.6 L4.8,12 L9.4,7.4 L8,6 L2,12 L8,18 L9.4,16.6 Z M14.6,16.6 L19.2,12 L14.6,7.4 L16,6 L22,12 L16,18 L14.6,16.6 L14.6,16.6 Z"
            id="Shape"
            fill={activeStyle(active)}
            fillRule="nonzero"
          />
        </g>
      </g>
    </g>
  </svg>
);

export const Bold: React.SFC<IToolbarIcons> = ({ active }) => (
  <svg width="11px" height="14px" viewBox="0 0 11 14">
    <desc>Created with Sketch.</desc>
    <defs />
    <g id="Views" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g id="Artboard" transform="translate(-423.000000, -123.000000)">
        <g id="Group-5" transform="translate(416.000000, 119.000000)">
          <path
            d="M15.6,10.79 C16.57,10.12 17.25,9.02 17.25,8 C17.25,5.74 15.5,4 13.25,4 L7,4 L7,18 L14.04,18 C16.13,18 17.75,16.3 17.75,14.21 C17.75,12.69 16.89,11.39 15.6,10.79 L15.6,10.79 Z M10,6.5 L13,6.5 C13.83,6.5 14.5,7.17 14.5,8 C14.5,8.83 13.83,9.5 13,9.5 L10,9.5 L10,6.5 Z M13.5,15.5 L10,15.5 L10,12.5 L13.5,12.5 C14.33,12.5 15,13.17 15,14 C15,14.83 14.33,15.5 13.5,15.5 Z"
            id="Shape"
            fill={activeStyle(active)}
            fillRule="nonzero"
          />
          <polygon id="Shape" points="0 0 24 0 24 24 0 24" />
        </g>
      </g>
    </g>
  </svg>
);

export const Italic: React.SFC<IToolbarIcons> = ({ active }) => (
  <svg width="12px" height="14px" viewBox="0 0 12 14">
    <desc>Italic</desc>
    <defs />
    <g id="Views" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g id="Artboard" transform="translate(-457.000000, -123.000000)">
        <g id="Group-6" transform="translate(451.000000, 119.000000)">
          <polygon id="Shape" points="0 0 24 0 24 24 0 24" />
          <polygon
            id="Shape"
            fill={activeStyle(active)}
            fillRule="nonzero"
            points="10 4 10 7 12.21 7 8.79 15 6 15 6 18 14 18 14 15 11.79 15 15.21 7 18 7 18 4"
          />
        </g>
      </g>
    </g>
  </svg>
);

export const Underline: React.SFC<IToolbarIcons> = ({ active }) => (
  <svg width="14px" height="18px" viewBox="0 0 14 18">
    <g id="Views" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g id="Artboard" transform="translate(-491.000000, -122.000000)">
        <g id="Group-7" transform="translate(486.000000, 119.000000)">
          <polygon id="Shape" points="0 0 24 0 24 24 0 24" />
          <path
            d="M12,17 C15.31,17 18,14.31 18,11 L18,3 L15.5,3 L15.5,11 C15.5,12.93 13.93,14.5 12,14.5 C10.07,14.5 8.5,12.93 8.5,11 L8.5,3 L6,3 L6,11 C6,14.31 8.69,17 12,17 Z M5,19 L5,21 L19,21 L19,19 L5,19 Z"
            id="Shape"
            fill={activeStyle(active)}
            fillRule="nonzero"
          />
        </g>
      </g>
    </g>
  </svg>
);

export const Mono: React.SFC<IToolbarIcons> = ({ active }) => (
  <svg width="10px" height="15px" viewBox="0 0 10 15">
    <desc>Created with Sketch.</desc>
    <defs />
    <g id="Views" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g id="Artboard" transform="translate(-528.000000, -124.000000)">
        <g id="Group-10" transform="translate(521.000000, 119.000000)">
          <rect id="Rectangle" x="0" y="0" width="24" height="24" />
          <polygon
            id="M"
            fill={activeStyle(active)}
            points="10.9918124 15.4581874 9.09524997 8.95568745 9.31199997 19.4499998 7 19.4499998 7 5 9.70937496 5 11.9852499 12.6765624 14.2249999 5 16.8621249 5 16.8621249 19.4499998 14.5501249 19.4499998 14.7668749 9.06406245 12.8883749 15.4581874"
          />
        </g>
      </g>
    </g>
  </svg>
);

export const Label: React.SFC<{ label: string; active: boolean }> = ({
  label,
  active
}) => <Span color={activeStyle(active)}>{label}</Span>;
