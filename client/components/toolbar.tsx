import * as React from "react";
import StyleButton from "./toolbar-button";
import styled from "styled-components";

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
  background: white;
  border-bottom-width: 1px;
  border-bottom-style: solid;
  border-bottom-color: rgba(0, 0, 0, 0.125);
`;

const BLOCK_TYPES = [
  { label: "H1", style: "header-one" },
  { label: "H2", style: "header-two" },
  { label: "H3", style: "header-three" },
  { label: "H4", style: "header-four" },
  { label: "Quote", style: "blockquote" },
  { label: "Bullets", style: "unordered-list-item" },
  { label: "Numbers", style: "ordered-list-item" },
  { label: "Code", style: "code-block" }
];

const INLINE_STYLES = [
  { label: "Bold", style: "BOLD" },
  { label: "Italic", style: "ITALIC" },
  { label: "Underline", style: "UNDERLINE" },
  { label: "Mono", style: "CODE" }
];

const FullToolBar: React.FC<any> = props => (
  <ToolbarWrapper>
    {BLOCK_TYPES.map(type => (
      <StyleButton
        key={type.label}
        active={type.style === props.blockType}
        label={type.label}
        onToggle={props.onToggleBlockType}
        style={type.style}
      />
    ))}
    {INLINE_STYLES.map(type => (
      <StyleButton
        key={type.label}
        active={props.currentStyle.has(type.style)}
        label={type.label}
        onToggle={props.onToggleInlineStyle}
        style={type.style}
      />
    ))}
  </ToolbarWrapper>
);

const SelectionToolBar: React.FC<any> = props => (
  <ToolbarWrapper>
    {props.selectedText.length > 0
      ? INLINE_STYLES.map(type => (
          <StyleButton
            key={type.label}
            active={props.currentStyle.has(type.style)}
            label={type.label}
            onToggle={props.onToggleInlineStyle}
            style={type.style}
          />
        ))
      : BLOCK_TYPES.map(type => (
          <StyleButton
            key={type.label}
            active={type.style === props.blockType}
            label={type.label}
            onToggle={props.onToggleBlockType}
            style={type.style}
          />
        ))}
  </ToolbarWrapper>
);

const Toolbar: React.FC<any> = props => {
  const selection = props.editorState.getSelection();
  const anchorKey = selection.getAnchorKey();
  const currentContent = props.editorState.getCurrentContent();
  const currentContentBlock = currentContent.getBlockForKey(anchorKey);
  const start = selection.getStartOffset();
  const end = selection.getEndOffset();
  const selectedText = currentContentBlock.getText().slice(start, end);
  const currentStyle = props.editorState.getCurrentInlineStyle();
  const blockType = props.editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType();

  return (
    <>
      {props.fullBar ? (
        <SelectionToolBar
          selectedText={selectedText}
          blockType={blockType}
          currentStyle={currentStyle}
          onToggleInlineStyle={props.onToggleInlineStyle}
          onToggleBlockType={props.onToggleBlockType}
        />
      ) : (
        <FullToolBar
          blockType={blockType}
          currentStyle={currentStyle}
          onToggleInlineStyle={props.onToggleInlineStyle}
          onToggleBlockType={props.onToggleBlockType}
        />
      )}
    </>
  );
};

export default Toolbar;
