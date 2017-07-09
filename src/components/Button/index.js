import React from 'react'
import { css } from 'glamor'

const BUTTON_SIZE = 62.5

const btn = css({
  display: 'block',
  fontSize: 16,
  backgroundColor: 'var(--color-6)',
  transition: 'background-color 250ms ease-in-out',
  color: 'white',
  border: 0,
  padding: 16,
  borderRadius: '50%',
  height: BUTTON_SIZE,
  width: BUTTON_SIZE,
  boxShadow: '0 0 4px rgba(0,0,0,.07), 0 4px 8px rgba(0,0,0,.14)',
  ':hover': {
    backgroundColor: 'var(--color-7)'
  }
})

const positionedSty = css({
  position: 'absolute',
  right: -32,
  top: -32
})

const Button = ({ onClick, positioned, type, ...args }) => (
  <button onClick={onClick} className={css(positioned ? [btn, positionedSty] : btn)} {...args} />
)

export default Button
