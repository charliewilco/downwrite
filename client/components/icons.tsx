import * as React from "react";

interface IIconAttributes {
  size?: number;
  fill?: string;
  className?: string;
}

const CloseIcon: React.SFC<IIconAttributes> = ({ size, fill, className }) => (
  <svg
    width={size}
    height={size}
    className={className}
    viewBox="0 0 12 12"
    style={{ display: "block" }}>
    <title>Close</title>
    <g id="Canvas" transform="translate(-1561 -730)">
      <g id="Close">
        <g id="Combined Shape">
          <use xlinkHref="#modalClose" transform="translate(1561 730)" fill={fill} />
        </g>
      </g>
    </g>
    <defs>
      <path
        id="modalClose"
        fillRule="evenodd"
        d="M 6.70588 6L 12 0.705882L 11.2941 0L 6 5.29412L 0.705882 2.83725e-14L 0 0.705882L 5.29412 6L 0 11.2941L 0.705882 12L 6 6.70588L 11.2941 12L 12 11.2941L 6.70588 6Z"
      />
    </defs>
  </svg>
);

const SignoutIcon: React.SFC<IIconAttributes> = ({ className }) => (
  <svg width={13} height={12} viewBox="0 0 13 12" className={className}>
    <title>Signout Icon</title>
    <g id="Canvas" transform="translate(-1806 -2684)">
      <g id="Signout Icon">
        <use
          xlinkHref="#signout"
          transform="matrix(-1 0 0 1 1818.5 2684)"
          fill="currentColor"
        />
      </g>
    </g>
    <defs>
      <path
        id="signout"
        fillRule="evenodd"
        d="M 8.55579 5.81383e-05C 8.39355 -0.00335983 8.22351 0.144345 8.22363 0.33331C 8.22375 0.521298 8.36951 0.670957 8.55579 0.666806L 11.8433 0.666806L 11.8433 11.3333L 8.55579 11.3333C 8.38232 11.3309 8.22363 11.4905 8.22363 11.6668C 8.22363 11.8428 8.38232 12.0025 8.55579 12.0001L 12.1716 12.0001C 12.3435 12.0001 12.4999 11.8411 12.5 11.6668L 12.5 0.333554C 12.4999 0.158994 12.3435 5.81383e-05 12.1716 5.81383e-05L 8.55579 5.81383e-05ZM 0.0927734 5.77081C 0.0460205 5.82037 0 5.92291 0 6.00006C 0.00134277 6.07818 0.0153809 6.15216 0.0927734 6.22906L 2.72424 9.06256C 2.84521 9.19317 3.05969 9.20465 3.18945 9.0755C 3.31226 8.95318 3.32068 8.73102 3.20227 8.60406L 1.08984 6.33331L 9.86841 6.33331C 10.05 6.33331 10.1973 6.1839 10.1973 5.99981C 10.1973 5.81573 10.05 5.66656 9.86841 5.66656L 1.08984 5.66656L 3.20227 3.39581C 3.32068 3.26886 3.3175 3.04107 3.18945 2.92437C 3.13293 2.87286 3.06775 2.84405 3.00195 2.83575C 2.901 2.8233 2.79871 2.85943 2.72424 2.93731L 0.0927734 5.77081Z"
      />
    </defs>
  </svg>
);

const NavIcon: React.SFC<IIconAttributes> = ({ className }) => (
  <svg width="20px" height="9px" viewBox="0 0 20 9" className={className}>
    <desc>Navicon</desc>
    <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g fill="inherit" id="NaviconGroup">
        <rect id="Rectangle-Copy-3" x="0" y="0" width="20" height="1" />
        <rect id="Rectangle-Copy-4" x={10} y="4" width={10} height="1" />
        <rect id="Rectangle-Copy-5" x={5} y="8" width={15} height="1" />
      </g>
    </g>
  </svg>
);

const ExportIcon: React.SFC<IIconAttributes> = ({ className }) => (
  <svg width="24" height="15" viewBox="0 0 24 15" className={className}>
    <title>Markdown Symbol</title>
    <g id="Canvas" transform="translate(-1311 -870)">
      <g id="Combined Shape">
        <use xlinkHref="#markdown" transform="translate(1311 870)" fill="#4382A1" />
      </g>
    </g>
    <defs>
      <path
        id="markdown"
        fillRule="evenodd"
        d="M 0 2C 0 0.895447 0.895386 0 2 0L 22 0C 23.1046 0 24 0.895447 24 2L 24 12.8235C 24 13.9281 23.1046 14.8235 22 14.8235L 2 14.8235C 0.895386 14.8235 0 13.9281 0 12.8235L 0 2ZM 3.46155 11.3492L 3.46155 3.47424L 5.76929 3.47424L 8.0769 6.36945L 10.3846 3.47424L 12.6923 3.47424L 12.6923 11.3492L 10.3846 11.3492L 10.3846 6.8327L 8.0769 9.72791L 5.76929 6.8327L 5.76929 11.3492L 3.46155 11.3492ZM 14.4231 7.52753L 17.8846 11.3492L 21.3462 7.52753L 19.0385 7.52753L 19.0385 3.47424L 16.7308 3.47424L 16.7308 7.52753L 14.4231 7.52753Z"
      />
    </defs>
  </svg>
);

CloseIcon.defaultProps = {
  size: 12,
  fill: "#4382A1"
};

export { CloseIcon, NavIcon, ExportIcon, SignoutIcon };
