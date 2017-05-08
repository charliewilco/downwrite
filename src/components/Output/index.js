import React from 'react'
import { convertToRaw } from 'draft-js'
import { Block } from 'jsxstyle'
import { StyleSheet, css } from 'aphrodite/no-important'

const styles = StyleSheet.create({
  output: {
    overflowWrap: 'break-word',
    wordBreak: 'break-all',
    fontSize: '87.5%'
  }
})

const Output = ({ editorState }) =>
  <Block
    className={css(styles.output)}
    children={JSON.stringify(convertToRaw(editorState.getCurrentContent()))}
  />

export default Output
