import React from 'react'
import { Block } from 'glamor/jsxstyle'
import { css } from 'glamor'

const mdButton = css({
  border: 0,
  display: 'block',
  '& > svg': {
    display: 'block'
  }
})

let color = 'rgba(37, 132, 164, .5)'

export default ({ exportToMarkdown, children }) => (
  <Block float='right' marginRight='-9rem' width='8rem'>
    <div style={{ marginBottom: 16 }}>
      <h6 style={{ fontSize: 16, marginBottom: 8 }}>Export as</h6>
      <button className={css(mdButton)} onClick={exportToMarkdown}>
        <svg width='25' height='15.38461538' viewBox='0 0 208 128'>
          <rect
            width='198'
            height='118'
            x='5'
            y='5'
            ry='10'
            stroke={color}
            strokeWidth='10'
            fill='none'
          />
          <path
            fill={color}
            d='M30 98v-68h20l20 25 20-25h20v68h-20v-39l-20 25-20-25v39zM155 98l-30-33h20v-35h20v35h20z'
          />
        </svg>
      </button>
    </div>
    {children}
  </Block>
)
