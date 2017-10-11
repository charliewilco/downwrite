import React, { Component, createElement as h } from 'react'
import { css } from 'glamor'
import { InlineBlock } from 'glamor/jsxstyle'
import {
  BlockQuote,
  BulletedList,
  Numbers,
  Code,
  Bold,
  Italic,
  Mono,
  Underline,
  Label
} from './Icon'

const findIcon = (label, active) => {
  switch (label) {
    case 'Quote':
      return h(BlockQuote, { active })
      break
    case 'Bullets':
      return h(BulletedList, { active })
      break
    case 'Numbers':
      return h(Numbers, { active })
      break
    case 'Code':
      return h(Code, { active })
      break
    case 'Bold':
      return h(Bold, { active })
      break
    case 'Italic':
      return h(Italic, { active })
      break
    case 'Underline':
      return h(Underline, { active })
      break
    case 'Mono':
      return h(Mono, { active })
      break
    default:
      return h(Label, { label, active })
  }
}

const btnStyle = css({
  padding: 8,
  flex: '1 1 auto',
  textAlign: 'center',
  color: 'var(--color-2)',
  fontSize: 12,
  transition: 'all 250ms ease-in-out'
})

export default class StyleButton extends Component {
  onToggle = e => {
    e.preventDefault()
    this.props.onToggle(this.props.style)
  }

  render () {
    const { active, label } = this.props

    return (
      <InlineBlock className={css(btnStyle)} onMouseDown={this.onToggle}>
        {findIcon(label, active)}
      </InlineBlock>
    )
  }
}
