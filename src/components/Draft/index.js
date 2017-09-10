import { Editor, RichUtils } from 'draft-js'
import React from 'react'
import { css } from 'glamor'
import { Flex } from 'glamor/jsxstyle'
import { createElement } from 'glamor/react'

require('./RichText.css')

/* @jsx createElement */

const editorStyle = css({
  padding: 16,
  background: 'white',
  height: '100%',
  width: '100%'
})

const toolbarStyle = css({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  paddingTop: 8,
  paddingBottom: 8,
  paddingRight: 16,
  paddingLeft: 16,
  fontFamily: 'var(--secondary-font)',
  background: 'white',
  borderBottomWidth: 1,
  borderBottomStyle: 'solid',
  borderBottomColor: 'rgba(0, 0, 0, .125)'
})

const editorShell = css({
  border: `1px solid rgba(0, 0, 0 ,.125)`,
  borderTop: 0,
  position: 'relative',
  paddingTop: 47
})

export default class extends React.Component {
  static displayName = 'DWEditor'

  state = {
    editorState: this.props.editorState
  }

  focus = () => this.refs.editor.focus()

  handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command)
    if (newState) {
      this.onChange(newState)
      return true
    }
    return false
  }

  onChange = editorState => this.props.onChange(editorState)

  onTab = e => {
    const maxDepth = 4
    this.onChange(RichUtils.onTab(e, this.props.editorState, maxDepth))
  }

  _toggleBlockType = blockType => {
    this.onChange(RichUtils.toggleBlockType(this.props.editorState, blockType))
  }

  _toggleInlineStyle = inlineStyle => {
    this.onChange(
      RichUtils.toggleInlineStyle(this.props.editorState, inlineStyle)
    )
  }

  render () {
    const { editorState, children } = this.props
    // If the user changes block type before entering any text, we can
    // either style the placeholder or hide it. Let's just hide it now.
    let className = 'RichEditor-editor'
    var contentState = editorState.getCurrentContent()
    if (!contentState.hasText()) {
      if (contentState.getBlockMap().first().getType() !== 'unstyled') {
        className += ' RichEditor-hidePlaceholder'
      }
    }

    return (
      <div
        className={`${css(editorShell)} OuterEditor`}
        css={{ height: '100%' }}>
        <ToolBar
          editorState={editorState}
          onToggleInlineStyle={this._toggleInlineStyle}
          onToggleBlockType={this._toggleBlockType}
          children={children}
        />
        <div
          className={`${css(editorStyle)} ${className}`}
          onClick={this.focus}>
          <Editor
            blockStyleFn={getBlockStyle}
            customStyleMap={styleMap}
            editorState={editorState}
            handleKeyCommand={this.handleKeyCommand}
            onChange={editorState => this.onChange(editorState)}
            onTab={this.onTab}
            placeholder='Tell a story...'
            ref='editor'
            spellCheck={true}
          />
        </div>
      </div>
    )
  }
}

// Custom overrides for "code" style.
const styleMap = {
  CODE: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    fontFamily: 'Input Mono, "Menlo", "Consolas", monospace',
    fontSize: 14,
    padding: 2
  }
}

function getBlockStyle (block){
  switch (block.getType()) {
    case 'blockquote':
      return 'RichEditor-blockquote'
    default:
      return null
  }
}

class StyleButton extends React.Component {
  constructor () {
    super()
    this.onToggle = e => {
      e.preventDefault()
      this.props.onToggle(this.props.style)
    }
  }
  render () {
    let className = 'RichEditor-styleButton'
    if (this.props.active) {
      className += ' RichEditor-activeButton'
    }
    return (
      <span css={{ flex: 1 }} className={className} onMouseDown={this.onToggle}>
        {this.props.label}
      </span>
    )
  }
}

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
  { label: 'Code', style: 'code-block' }
]

const BlockStyleControls = ({ editorState, onToggle, width }) => {
  const selection = editorState.getSelection()
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType()
  return (
    <Flex width={width} className='RichEditor-controls'>
      {BLOCK_TYPES.map(type => (
        <StyleButton
          key={type.label}
          active={type.style === blockType}
          label={type.label}
          onToggle={onToggle}
          style={type.style}
        />
      ))}
    </Flex>
  )
}

var INLINE_STYLES = [
  { label: 'Bold', style: 'BOLD' },
  { label: 'Italic', style: 'ITALIC' },
  { label: 'Underline', style: 'UNDERLINE' },
  { label: 'Mono', style: 'CODE' }
]

const InlineStyleControls = ({ editorState, onToggle, width }) => {
  const currentStyle = editorState.getCurrentInlineStyle()
  return (
    <Flex width={width} className='RichEditor-controls'>
      {INLINE_STYLES.map(type => (
        <StyleButton
          key={type.label}
          active={currentStyle.has(type.style)}
          label={type.label}
          onToggle={onToggle}
          style={type.style}
        />
      ))}
    </Flex>
  )
}

const ToolBar = ({
  children,
  editorState,
  onToggleBlockType,
  onToggleInlineStyle
}) => (
  <Flex className={css(toolbarStyle)} alignItems='center'>
    <BlockStyleControls
      editorState={editorState}
      onToggle={onToggleBlockType}
    />
    <InlineStyleControls
      editorState={editorState}
      onToggle={onToggleInlineStyle}
    />

    <div css={{ flex: 1, alignSelf: 'flex-end' }}>{children}</div>
  </Flex>
)
