import React from 'react'
import StyleButton from './Button'
import { css } from 'glamor'
import { Flex } from 'glamor/jsxstyle'

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

var INLINE_STYLES = [
  { label: 'Bold', style: 'BOLD' },
  { label: 'Italic', style: 'ITALIC' },
  { label: 'Underline', style: 'UNDERLINE' },
  { label: 'Mono', style: 'CODE' }
]

const Toolbar = ({
  children,
  editorState,
  onToggleBlockType,
  onToggleInlineStyle
}) => {
  const currentStyle = editorState.getCurrentInlineStyle()
  const selection = editorState.getSelection()
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType()
  return (
    <Flex className={css(toolbarStyle)} flexWrap='wrap' alignItems='center'>
      {BLOCK_TYPES.map(type => (
        <StyleButton
          key={type.label}
          active={type.style === blockType}
          label={type.label}
          onToggle={onToggleBlockType}
          style={type.style}
        />
      ))}
      {INLINE_STYLES.map(type => (
        <StyleButton
          key={type.label}
          active={currentStyle.has(type.style)}
          label={type.label}
          onToggle={onToggleInlineStyle}
          style={type.style}
        />
      ))}

      <div css={{ flex: 1, alignSelf: 'flex-end' }}>{children}</div>
    </Flex>
  )
}

export default Toolbar
