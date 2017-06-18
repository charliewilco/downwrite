import React from 'react'
import { css } from 'glamor'

const BUTTON_SIZE = 62.5

const btn = css({
  display: 'block',
  backgroundColor: '#2584A5',
  transition: 'background-color 250ms ease-in-out',
  color: 'white',
  border: 0,
  padding: 16,
  borderRadius: '50%',
  maxHeight: BUTTON_SIZE,
  width: BUTTON_SIZE,
  height: '100%',
  boxShadow: '0 0 4px rgba(0,0,0,.07), 0 4px 8px rgba(0,0,0,.14)',
  ':hover': {
    backgroundColor: 'var(--color-2)'
  }
})

const positionedSty = css({
  position: 'absolute',
  left: -32,
  top: -32
})

const Button = ({ onClick, positioned, type, ...args }) => {
  let btnStyle = css(
    positioned ? [btn, positionedSty] : btn
  )

  return (
    <button onClick={onClick} className={btnStyle} {...args} />
  )
}

export default Button
