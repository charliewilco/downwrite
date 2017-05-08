import React from 'react'
import { StyleSheet, css } from 'aphrodite/no-important'

const styles = StyleSheet.create({
  input: {
    display: 'block',
    backgroundColor: 'white',
    width: '100%',
    appearance: 'none',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0,0,0,.125)',
    padding: 16
  }
})

const Input = ({ onChange, ...args }) =>
  <input className={css(styles.input)} onChange={onChange} {...args} />

export default Input
