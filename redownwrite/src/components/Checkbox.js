import React from 'react'
import { css } from 'glamor'
import icon from './check.svg'

const sharedStyle = css({
  display: 'inline-block',
  borderRadius: 4,
  verticalAlign: 'middle',
  width: 20,
  height: 20,
  appearance: 'none',
  border: 0
})

const checkedStyle = css(sharedStyle, {
  background: `var(--color-1) url(${icon}) no-repeat center center`,
  border: 0
})

const unCheckedStyle = css(sharedStyle, { background: '#D0D0D0' })

export default props => (
  <input
    type="checkbox"
    className={css(props.checked ? checkedStyle : unCheckedStyle)}
    {...props}
  />
)
