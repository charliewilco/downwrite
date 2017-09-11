import React, { Component } from 'react'
import { css } from 'glamor'
import { InlineBlock } from 'glamor/jsxstyle'

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
      <InlineBlock
        className={css(btnStyle)}
        opacity={active ? 1 : 0.375}
        onMouseDown={this.onToggle}>
        {label}
      </InlineBlock>
    )
  }
}
