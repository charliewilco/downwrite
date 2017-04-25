import React from 'react'
import { Editor, RichUtils } from 'draft-js'
import { connect } from 'react-redux'
import Toolbar from '../Toolbar'
import { StyleSheet, css } from 'aphrodite'

const styles = StyleSheet.create({
  editorShell: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0,0,0,.125)'
  },
  inner: {
    padding: 16,
    fontFamily: 'Charter, Georgia, PT Serif, serif'
  },
  code: {
    fontFamily: 'SFMono-Light'
  },
  placeholder: {
    fontStyle: 'italic',
    opacity: 0.5
  }
})

const INLINE_TYPES = [
  { label: 'Bold', style: 'BOLD' },
  { label: 'Italic', style: 'ITALIC' },
  { label: 'Underline', style: 'UNDERLINE' },
  { label: 'Monospace', style: 'CODE' }
]

const BLOCK_TYPES = [
  { label: 'H1', style: 'header-one' },
  { label: 'H2', style: 'header-two' },
  { label: 'H3', style: 'header-three' },
  { label: 'H4', style: 'header-four' },
  { label: 'H5', style: 'header-five' },
  { label: 'H6', style: 'header-six' },
  { label: 'Blockquote', style: 'blockquote' },
  { label: 'UL', style: 'unordered-list-item' },
  { label: 'OL', style: 'ordered-list-item' },
  { label: 'Codeblock', style: 'code-block' }
]

const styleMap = {
  CODE: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: 'Roboto Mono, Inconsolata, Menlo, Consolas, monospace',
    padding: 2
  },
  UNDERLINE: {
    textDecoration: 'underline'
  }
}

function getBlockStyle (block) {
  switch (block.getType()) {
    case 'blockquote':
      return css(styles.blockquote)
    case 'code-block':
      return css(styles.code)
    default:
      return null
  }
}

class DWEditor extends React.Component {
  focus = () => this.refs.editor.focus()

  onChange = (editorState) => this.props.onChange(editorState)

  handleKeyCommand = (command) => {
    const { editorState } = this.props
    const newState = RichUtils.handleKeyCommand(editorState, command)
    if (newState) {
      this.onChange(newState)
      return true
    }
    return false
  }

  toggleBlockType = (blockType) => {
    const r = RichUtils.toggleBlockType(this.props.editorState, blockType)
    this.onChange(r)
  }

  toggleInlineStyle = (inlineStyle) => {
    const r =  RichUtils.toggleInlineStyle(this.props.editorState, inlineStyle)
    this.onChange(r)
  }

  render () {
    const { editorState } = this.props

    const contentState = editorState.getCurrentContent()
    const className = css(
      (!contentState.hasText() && contentState.getBlockMap().first().getType() !== 'unstyled')
        ? [styles.inner, styles.placeholder]
        : [styles.inner]
    )

    return (
      <div className={css(styles.editorShell)}>
        <button onClick={() => this.props.saveThis(editorState)}>Add</button>
        <Toolbar types={BLOCK_TYPES} editorState={editorState} onToggle={this.toggleBlockType} />
        <Toolbar types={INLINE_TYPES} editorState={editorState} onToggle={this.toggleInlineStyle} />
        <div className={className} onClick={this.focus}>
          <Editor
            blockStyleFn={getBlockStyle}
            customStyleMap={styleMap}
            editorState={editorState}
            handleKeyCommand={this.handleKeyCommand}
            onChange={this.onChange}
            placeholder='Let’s get started'
            ref='editor'
            spellCheck
          />
        </div>
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return { saveThis:  dispatch.addPost }
}

export default connect(mapDispatchToProps)(DWEditor)
