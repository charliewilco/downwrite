import React from 'react'
import { Editor, RichUtils } from 'draft-js'
import Toolbar from '../Toolbar'
import Button from '../Button'
import { css } from 'glamor'

const editorShell = css({
  backgroundColor: 'white',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'rgba(0, 0, 0, .125)',
  position: 'relative'
})

const inner = css({
  padding: 16,
  fontFamily: 'Charter, Georgia, PT Serif, serif'
})

const blockquoteStyle = css({
  paddingLeft: 16,
  fontStyle: 'italic',
  color: 'black'
})

const codeStyle = css({
  fontFamily: 'SFMono-Light'
})

const placeholder = css(inner, {
  fontStyle: 'italic',
  opacity: 0.5
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
      return css(blockquoteStyle)
    case 'code-block':
      return css(codeStyle)
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
    const r = RichUtils.toggleInlineStyle(this.props.editorState, inlineStyle)
    this.onChange(r)
  }

  render () {
    const { editorState, addNew } = this.props

    let contentState = editorState.getCurrentContent()

    const className = css(
      (!contentState.hasText() && contentState.getBlockMap().first().getType() !== 'unstyled')
        ? placeholder
        : inner

    )

    return (
      <div className={css(editorShell)}>
        <Toolbar types={BLOCK_TYPES} editorState={editorState} onToggle={this.toggleBlockType} />
        <Toolbar types={INLINE_TYPES} editorState={editorState} onToggle={this.toggleInlineStyle} />
        {addNew && <Button positioned onClick={this.props.addNew}>Add</Button>}
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

export default DWEditor
