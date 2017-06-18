import React from 'react'
import { convertToRaw } from 'draft-js'
import { Block } from 'glamor-jsxstyle'
import { css } from 'glamor'

const outputStyle = css({
  overflowWrap: 'break-word',
  wordBreak: 'break-all',
  fontSize: '87.5%'
})

const Output = ({ editorState }) =>
  <Block
    className={css(outputStyle)}
    children={JSON.stringify(convertToRaw(editorState.getCurrentContent()))}
  />

export default Output
