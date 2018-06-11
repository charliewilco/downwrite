import React from 'react'
import styled from 'styled-components'

const ExportButton = styled.button`
  border: 0;
  display: flex;
  align-items: center;
  font-family: inherit;
  appearance: none;
  color: inherit;
  background: none;
`

const ExportIcon = styled.svg`
  display: block;
  margin-right: 8px;
`

const ExportLabel = styled.small`
  font-size: 12px;
`

export default ({ onClick }) => (
  <ExportButton onClick={onClick}>
    <ExportIcon width="24" height="15" viewBox="0 0 24 15">
      <title>Markdown Symbol</title>
      <g id="Canvas" transform="translate(-1311 -870)">
        <g id="Combined Shape">
          <use
            xlinkHref="#markdown"
            transform="translate(1311 870)"
            fill="#4382A1"
          />
        </g>
      </g>
      <defs>
        <path
          id="markdown"
          fillRule="evenodd"
          d="M 0 2C 0 0.895447 0.895386 0 2 0L 22 0C 23.1046 0 24 0.895447 24 2L 24 12.8235C 24 13.9281 23.1046 14.8235 22 14.8235L 2 14.8235C 0.895386 14.8235 0 13.9281 0 12.8235L 0 2ZM 3.46155 11.3492L 3.46155 3.47424L 5.76929 3.47424L 8.0769 6.36945L 10.3846 3.47424L 12.6923 3.47424L 12.6923 11.3492L 10.3846 11.3492L 10.3846 6.8327L 8.0769 9.72791L 5.76929 6.8327L 5.76929 11.3492L 3.46155 11.3492ZM 14.4231 7.52753L 17.8846 11.3492L 21.3462 7.52753L 19.0385 7.52753L 19.0385 3.47424L 16.7308 3.47424L 16.7308 7.52753L 14.4231 7.52753Z"
        />
      </defs>
    </ExportIcon>
    <ExportLabel>Markdown</ExportLabel>
  </ExportButton>
)
