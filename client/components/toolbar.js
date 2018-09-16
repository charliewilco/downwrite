import React from 'react';
import StyleButton from './toolbar-button';
import styled from 'styled-components';
import { fonts } from '../utils/defaultStyles';

const ToolbarWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  position: absolute;
  top: 0px;
  left: 0px;
  right: 0px;
  padding-top: 8px;
  padding-bottom: 8px;
  padding-right: 16px;
  padding-left: 16px;
  font-family: ${fonts.sans};
  background: white;
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: rgba(0, 0, 0, 0.125);
`;

const BLOCK_TYPES = [
  { label: 'H1', style: 'header-one' },
  { label: 'H2', style: 'header-two' },
  { label: 'H3', style: 'header-three' },
  { label: 'H4', style: 'header-four' },
  { label: 'Quote', style: 'blockquote' },
  { label: 'Bullets', style: 'unordered-list-item' },
  { label: 'Numbers', style: 'ordered-list-item' },
  { label: 'Code', style: 'code-block' }
];

const INLINE_STYLES = [
  { label: 'Bold', style: 'BOLD' },
  { label: 'Italic', style: 'ITALIC' },
  { label: 'Underline', style: 'UNDERLINE' },
  { label: 'Mono', style: 'CODE' }
];

const FullToolBar = ({
  onToggleBlockType,
  onToggleInlineStyle,
  currentStyle,
  blockType
}) => (
  <ToolbarWrapper>
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
  </ToolbarWrapper>
);

const SelectionToolBar = ({
  selectedText,
  currentStyle,
  onToggleInlineStyle,
  onToggleBlockType,
  blockType
}) => (
  <ToolbarWrapper>
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
  </ToolbarWrapper>
);

const Toolbar = ({
  editorState,
  onToggleBlockType,
  onToggleInlineStyle,
  fullBar
}) => {
  const selection = editorState.getSelection();
  const anchorKey = selection.getAnchorKey();
  const currentContent = editorState.getCurrentContent();
  const currentContentBlock = currentContent.getBlockForKey(anchorKey);
  const start = selection.getStartOffset();
  const end = selection.getEndOffset();
  const selectedText = currentContentBlock.getText().slice(start, end);
  const currentStyle = editorState.getCurrentInlineStyle();
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  return (
    <>
      {fullBar ? (
        <SelectionToolBar
          selectedText={selectedText}
          blockType={blockType}
          currentStyle={currentStyle}
          onToggleInlineStyle={onToggleInlineStyle}
          onToggleBlockType={onToggleBlockType}
        />
      ) : (
        <FullToolBar
          blockType={blockType}
          currentStyle={currentStyle}
          onToggleInlineStyle={onToggleInlineStyle}
          onToggleBlockType={onToggleBlockType}
        />
      )}
    </>
  );
};

export default Toolbar;
