import React from 'react'
import { convertToRaw } from 'draft-js'
import { Block } from 'jsxstyle'

const Output = ({ editorState }) =>
  <Block
    className='small'
    children={JSON.stringify(convertToRaw(editorState.getCurrentContent()))}
  />

export default Output
