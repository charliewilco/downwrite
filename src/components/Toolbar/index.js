import React from 'react'
import Btn from './Button'
import { css } from 'glamor'
import { Flex } from 'glamor/jsxstyle'

const toolbar = css({
  backgroundColor: 'white',
  borderStyle: 'solid',
  borderWidth: 0,
  borderBottomWidth: 1,
  borderColor: 'rgba(0, 0, 0, .125)'
})

const Toolbar = ({ editorState, onToggle, types }) => {
  const selection = editorState.getSelection()
  const blockType = editorState
    .getCurrentContent()
    .getBlockForKey(selection.getStartKey())
    .getType()
  const currentStyle = editorState.getCurrentInlineStyle()

  return (
    <Flex
      alignItems='center'
      flexWrap='wrap'
      justifyContent='space-around'
      className={css(toolbar)}>
      {types.map((type, i) => (
        <Btn
          key={i}
          active={type.style === blockType || currentStyle.has(type.style)}
          label={type.label}
          onToggle={onToggle}
          style={type.style}
        />
      ))}
    </Flex>
  )
}

export default Toolbar
