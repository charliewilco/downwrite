import React from 'react'
import Editor from './Editor'
import Output from './Output'
import Input from './Input'
import Wrapper from './Wrapper'

export default ({ editorState, onChange }) =>
  <div>
    <Wrapper padding={16}>
      <Input value='Hello' style={{ marginBottom: 16 }} />
      <Editor editorState={editorState} onChange={onChange} />
    </Wrapper>
    <Wrapper padding={16}>
      <Output editorState={editorState} />
    </Wrapper>
  </div>
