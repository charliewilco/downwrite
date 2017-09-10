// @flow

import React from 'react'
import { css } from 'glamor'

const btn = css({
  display: 'block',
  fontSize: 14,
  backgroundColor: 'var(--color-6)',
  transition: 'background-color 250ms ease-in-out',
  color: 'white',
  border: 0,
  paddingTop: 4,
  paddingLeft: 12,
  paddingRight: 12,
  paddingBottom: 4,
  borderRadius: 4,
  boxShadow: '0 0 4px rgba(0,0,0,.037), 0 4px 8px rgba(0,0,0,.07)',
  ':hover': {
    backgroundColor: 'var(--color-7)'
  }
})

const positionedSty = css(
  {
    position: 'fixed',
    top: 64,
    right: 32,
    '@media only screen and (min-width: 48rem)': {
      position: 'absolute',
      right: -16,
      top: -32
    }
  },
  btn
)

type Props = {
  positioned: Boolean,
  args: Object
}

const Button = ({ positioned, ...args }: Props) => (
  <button className={css(positioned ? positionedSty : btn)} {...args} />
)

export default Button
