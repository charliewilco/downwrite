import React from 'react'
import Editor from './Editor'
import Output from './Output'
import Input from './Input'
import Wrapper from './Wrapper'

export default ({ editorState, onChange, title, onTitleChange, addNew }) =>
  <div>
    <Wrapper padding={16}>
      <Input value={title} onChange={e => onTitleChange(e.target.value)} />
      <Editor addNew={addNew} editorState={editorState} onChange={onChange} />
    </Wrapper>
    <Wrapper padding={16}>
      <Output editorState={editorState} />
    </Wrapper>
  </div>
