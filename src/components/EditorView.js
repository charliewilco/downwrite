import React from 'react'
import Editor from './Editor'
import Output from './Output'
import Wrapper from './Wrapper'

export default ({ editorState, onChange }) =>
  <div>
    <h1 className='u-center'>Hello</h1>
    <Wrapper padding={16}>
      <Editor editorState={editorState} onChange={onChange} />
    </Wrapper>
    <Wrapper padding={16}>
      <Output editorState={editorState} />
    </Wrapper>
  </div>
