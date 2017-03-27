import React, { Component } from 'react'
import { StyleSheet } from 'aphrodite'
import { Editor, EditorState, RichUtils } from 'draft-js'
import 'draft-js/dist/Draft.css'

import './index.css'

const styles = StyleSheet.create({
  editor: {
    background: 'pink'
  }
})

class DWEditor extends Component {
  constructor (props) {
    super(props)
    this.state = { editorState: EditorState.createEmpty() }
    this.onChange = editorState => this.setState({ editorState })
  }

  onBoldClick () {
    this.onChange(RichUtils.toggleInlineStyle(this.state.editorState, 'BOLD'))
  }

  handleKeyCommand (command) {
    const newState = RichUtils.handleKeyCommand(this.state.editorState, command)

    if (newState) {
      this.onChange(newState)
      return 'handled'
    }
    return 'not-handled'
  }

  render () {
    return (
      <div className='Container Container--center Container--md u-px2'>
        <h1 className='h4 u-w300'>Editor Component</h1>
        <Editor
          customStyleMap={styles.editor}
          handleKeyCommand={this.handleKeyCommand}
          editorState={this.state.editorState}
          onChange={this.onChange}
        />
      </div>
    )
  }
}

export default DWEditor
