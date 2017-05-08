import React from 'react'
import { StyleSheet, css } from 'aphrodite/no-important'

const styles = StyleSheet.create({
  input: {
    display: 'block',
    backgroundColor: 'white',
    width: '100%',
    appearance: 'none',
    border: `1px solid var(--color-1)`,
    padding: 16
  }
})

const Input = ({ onChange, ...args }) =>
  <input className={css(styles.input)} onChange={onChange} {...args} />

export default Input
