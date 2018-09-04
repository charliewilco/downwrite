import * as React from 'react'

const Navicon: React.SFC<{ open: boolean }> = ({ open }) => (
  <svg width="20px" height="9px" viewBox="0 0 20 9" className="Navicon">
    <desc>Navicon</desc>
    <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
      <g fill="inherit" id="NaviconGroup">
        <rect id="Rectangle-Copy-3" x="0" y="0" width="20" height="1" />
        <rect
          id="Rectangle-Copy-4"
          x={open ? 0 : 10}
          y="4"
          width={open ? 20 : 10}
          height="1"
        />
        <rect
          id="Rectangle-Copy-5"
          x={open ? 0 : 5}
          y="8"
          width={open ? 20 : 15}
          height="1"
        />
      </g>
    </g>
  </svg>
)

export default Navicon
