import { createGlobalStyle } from "styled-components";

const DraftStyles = createGlobalStyle`
.RichEditor-root {
  font-size: 14px;
}

.RichEditor-editor {
  cursor: text;
  position: relative;
}

.public-DraftEditorPlaceholder-inner {
  opacity: 0.5;
  margin-top: 16px;
  position: absolute;
  top: 0;
  font-style: italic;
}

.RichEditor-editor .public-DraftEditor-content {
  min-height: 100px;
}

.RichEditor-hidePlaceholder .public-DraftEditorPlaceholder-root {
  display: none;
}

.RichEditor-editor .RichEditor-blockquote {
  border-left: 5px solid #eee;
  color: #666;
  font-family: inherit;
  font-style: italic;
  margin: 16px 0 16px -5px;
  padding: 10px 20px;
}

.RichEditor-editor .public-DraftStyleDefault-pre {
  background-color: rgba(0, 0, 0, 0.05);
  font-family: 'Input Mono', 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo,
    Courier, monospace;
  font-size: 16px;
  padding: 20px;
}

.RichEditor-controls {
  font-family: inherit;
  font-size: 13px;
  user-select: none;
}

.RichEditor-styleButton {
  color: #999;
  cursor: pointer;
  margin-right: 16px;
  padding: 2px 0;
  display: inline-block;
}

.RichEditor-activeButton {
  color: #5890ff;
}

/*
** Overrides for Draft.js
*/

.RichEditor-editor h2 {
  font-size: 137.5%;
}

.RichEditor-editor h3 {
  font-size: 125%;
}

.RichEditor-editor h4 {
  font-size: 112.5%;
}

.RichEditor-editor h5 {
  font-size: 100%;
}

.RichEditor-editor h6 {
  font-size: 87.5%;
}

.RichEditor-editor pre {
  background: #f4f5f5;
  padding: 0.75rem;
  font-size: 13px;
}

.NightMode .RichEditor-editor pre {
  color: #4c4c4c;
}

.public-DraftStyleDefault-orderedListItem > *,
.public-DraftStyleDefault-unorderedListItem > * {
  display: inline;
}
`;

export default DraftStyles;
