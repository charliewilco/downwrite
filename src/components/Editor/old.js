import React from 'react'
import { EditorState } from 'draft-js'
import Toolbar from '../Toolbar'
import Output from '../Output'
import { Block } from 'jsxstyle'
import Editor from './'

class DWEditor extends React.Component {
  state = {
    editorState: EditorState.createEmpty()
  }

  render () {
    const { editorState } = this.state

    return (
      <div className='u-cf'>
        <Block padding={16} margin='1rem auto' className='Column--8/12'>
          <Editor editorState={editorState} onChange={editorState => this.setState({ editorState })} />
        </Block>
        <Block margin='0 auto 1rem' padding={16} className='Column--8/12'>
          <Output editorState={editorState} />
        </Block>
      </div>
    )
  }
}

export default DWEditor
