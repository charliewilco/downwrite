export default function Logo() {
  return (
    <div className="w-8">
      <svg
        className="block max-w-full min-h-full"
        width={33}
        height={50}
        viewBox="0 0 33 50">
        <title>Downwrite Logo</title>
        <g fill="none" fillRule="evenodd">
          <path
            d="M16.469 5.275V30.97c1.202 0 2.176.965 2.176 2.155s-.974 2.155-2.176 2.155v9.444l10.101-9.594L16.47 5.275z"
            fill="#fff"
          />
          <path
            d="M14.293 33.126c0-1.19.974-2.155 2.176-2.155V5.275L6.367 35.13l10.102 9.594v-9.444a2.165 2.165 0 0 1-2.176-2.155z"
            fill="#E5E5E5"
          />
          <path
            d="M32.938 50H0V0h32.938v50zM1.63 48.47h29.677V1.53H1.63v46.94z"
            fill="#fff"
          />
        </g>
      </svg>
    </div>
  );
}
