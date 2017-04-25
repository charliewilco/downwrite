import React, { Component } from 'react'
import { StyleSheet, css } from 'aphrodite'
import { Flex } from 'jsxstyle'

const styles = StyleSheet.create({
  btn: {
    padding: 8,
    opacity: .375,
    flex: '1 1 auto',
    textAlign: 'center',
    color: 'var(--color-2)',
    fontSize: 12,
    transition: 'all 250ms ease-in-out'
  },
  btnToggled: {
    opacity: 1
  },
  toolbar: {
    backgroundColor: 'white',
    borderStyle: 'solid',
    borderWidth: 0,
    borderBottomWidth: 1,
    borderColor: 'rgba(0, 0, 0, .125)'
  }
})

class StyleButton extends Component {
  onToggle = (e) => {
    e.preventDefault()
    this.props.onToggle(this.props.style)
  }

  render () {
    const { active, label } = this.props
    const className = css(active ? [styles.btn, styles.btnToggled] : styles.btn)

    return (<span className={className} onMouseDown={this.onToggle}>{label}</span>)
  }
}

const Toolbar = ({ editorState, onToggle, types }) => {
  const selection = editorState.getSelection()
  const blockType = editorState.getCurrentContent().getBlockForKey(selection.getStartKey()).getType()
  const currentStyle = editorState.getCurrentInlineStyle()

  return (
    <Flex alignItems='center' flexWrap='wrap' justifyContent='space-around' className={css(styles.toolbar)}>
      {types.map((type) =>
        <StyleButton
          key={type.label}
          active={type.style === blockType || currentStyle.has(type.style)}
          label={type.label}
          onToggle={onToggle}
          style={type.style}
        />
      )}
    </Flex>
  )
}

export default Toolbar
