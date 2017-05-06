import React from 'react'
import { StyleSheet, css } from 'aphrodite'

const BUTTON_SIZE = 62.5

const styles = StyleSheet.create({
  btn: {
    backgroundColor: '#2584A5',
    color: 'white',
    border: 0,
    padding: 16,
    position: 'absolute',
    left: 0,
    borderRadius: '50%',
    maxHeight: BUTTON_SIZE,
    width: BUTTON_SIZE,
    height: '100%'
  }
})

const Button = ({ onClick, content, type }) => {
  let btnStyle = css(styles.btn)
  return (
    <button onClick={onClick} className={btnStyle}>{content}</button>
  )
}

export default Button
