import React from 'react'
import { css } from 'glamor'

let styles = css({
  display: 'block',
  backgroundColor: 'white',
  width: '100%',
  appearance: 'none',
  borderWidth: 1,
  borderStyle: 'solid',
  borderRadius: 0,
  borderColor: 'rgba(0,0,0,.125)',
  padding: 16
})

const Input = ({ onChange, type, inputRef, ...args }) => (
  <input
    className={css(styles)}
    type={type}
    ref={inputRef}
    onChange={onChange}
    {...args}
  />
)

Input.defaultProps = {
  type: 'text'
}

export default Input
