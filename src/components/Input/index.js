import React from 'react'
import { css } from 'glamor'

let styles = css({
  display: 'block',
  backgroundColor: 'white',
  width: '100%',
  appearance: 'none',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'rgba(0,0,0,.125)',
  padding: 16
})

const Input = ({ onChange, type, ...args }) =>
  <input className={css(styles)} type={type} onChange={onChange} {...args} />

Input.defaultProps = {
  type: 'text'
}

export default Input
