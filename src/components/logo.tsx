export function Logo() {
  return (
    <div>
      <svg viewBox="0 0 337 264" fill="none" className="LogoIcon">
        <title>Downwrite Logo</title>
        <rect
          x={0.327148}
          y={245.34}
          width={336.15}
          height={17.9439}
          rx={8.97196}
          fill="url(#paint0_linear)"
        />
        <g id="nib-a">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M242.856.411L104.561 138.706c6.541 6.541 6.651 17.037.245 23.442-6.405 6.406-16.9 6.296-23.442-.245l-50.826 50.825 106.616 3.35L242.856.411z"
            fill="currentColor"
          />
        </g>
        <g id="nib-b">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M81.3 138.644c6.406-6.406 16.82-6.378 23.26.063L242.856.411 28.035 106.96l2.503 105.769 50.826-50.825c-6.442-6.44-6.47-16.854-.064-23.259z"
            fill="currentColor"
          />
        </g>
        <defs>
          <linearGradient
            id="paint0_linear"
            x1={-5.6542}
            y1={253.714}
            x2={336.477}
            y2={253.714}
            gradientUnits="userSpaceOnUse">
            <stop stopColor="#2597F1" />
            <stop offset={1} stopColor="#FFBE0F" />
          </linearGradient>
        </defs>
      </svg>
      <style jsx>{`
        div {
          display: flex;
          flex-direction: column;
          justify-content: center;
          width: 100%;
          height: 100%;
        }
        svg {
          width: 100%;
          height: 100%;
          display: block;
        }
        #nib-a {
          color: var(--onyx-800);
        }

        #nib-b {
          color: var(--onyx-800);
        }

        @media (prefers-color-scheme: dark) {
          #nib-a {
            color: var(--onyx-100);
          }

          #nib-b {
            color: var(--onyx-200);
          }
        }
      `}</style>
    </div>
  );
}
