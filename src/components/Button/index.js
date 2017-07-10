import React from 'react'
import { css } from 'glamor'


const btn = css({
  display: 'block',
  fontSize: 16,
  backgroundColor: 'var(--color-6)',
  transition: 'background-color 250ms ease-in-out',
  color: 'white',
  border: 0,
  padding: 16,
  borderRadius: '50%',
  height: 62.5,
  width: 62.5,
  boxShadow: '0 0 4px rgba(0,0,0,.07), 0 4px 8px rgba(0,0,0,.14)',
  ':hover': {
    backgroundColor: 'var(--color-7)'
  }
})

const positionedSty = css({
  position: 'absolute',
  right: -32,
  top: -32
}, btn)

const Button = ({ onClick, positioned, type, ...args }) => (
  <button onClick={onClick} className={css(positioned ? positionedSty : btn)} {...args} />
)

export default Button
