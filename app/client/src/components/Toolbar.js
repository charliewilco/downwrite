import React from 'react'
import StyleButton from './ToolbarButton'
import Media from 'react-media'
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
  { label: 'Quote', style: 'blockquote' },
  { label: 'Bullets', style: 'unordered-list-item' },
  { label: 'Numbers', style: 'ordered-list-item' },
  { label: 'Code', style: 'code-block' }
]

const INLINE_STYLES = [
  { label: 'Bold', style: 'BOLD' },
  { label: 'Italic', style: 'ITALIC' },
  { label: 'Underline', style: 'UNDERLINE' },
  { label: 'Mono', style: 'CODE' }
]

const FullToolBar = ({
  onToggleBlockType,
  children,
  onToggleInlineStyle,
  currentStyle,
  blockType
}) => (
  <Flex className={css(toolbarStyle)} flexWrap="wrap" alignItems="center">
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
  </Flex>
)

const SelectionToolBar = ({
  children,
  selectedText,
  currentStyle,
  onToggleInlineStyle,
  onToggleBlockType,
  blockType
}) => (
  <Flex className={css(toolbarStyle)} flexWrap="wrap" alignItems="center">
    {selectedText.length > 0
      ? INLINE_STYLES.map(type => (
          <StyleButton
            key={type.label}
            active={currentStyle.has(type.style)}
            label={type.label}
            onToggle={onToggleInlineStyle}
            style={type.style}
          />
        ))
      : BLOCK_TYPES.map(type => (
          <StyleButton
            key={type.label}
            active={type.style === blockType}
            label={type.label}
            onToggle={onToggleBlockType}
            style={type.style}
          />
        ))}
  </Flex>
)

const Toolbar = ({ children, editorState, onToggleBlockType, onToggleInlineStyle }) => {
  const selection = editorState.getSelection()
  const anchorKey = selection.getAnchorKey()
  const currentContent = editorState.getCurrentContent()
  const currentContentBlock = currentContent.getBlockForKey(anchorKey)
  const start = selection.getStartOffset()
  const end = selection.getEndOffset()
  const selectedText = currentContentBlock.getText().slice(start, end)
  const currentStyle = editorState.getCurrentInlineStyle()
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType()

  return (
    <Media query={{ minWidth: 500 }}>
      {matches =>
        !matches ? (
          <SelectionToolBar
            selectedText={selectedText}
            blockType={blockType}
            currentStyle={currentStyle}
            onToggleInlineStyle={onToggleInlineStyle}
            onToggleBlockType={onToggleBlockType}
            children={children}
          />
        ) : (
          <FullToolBar
            blockType={blockType}
            currentStyle={currentStyle}
            onToggleInlineStyle={onToggleInlineStyle}
            onToggleBlockType={onToggleBlockType}
            children={children}
          />
        )
      }
    </Media>
  )
}

export default Toolbar
