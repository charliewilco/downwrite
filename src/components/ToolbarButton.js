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
} from './ToolbarIcon'

const btnStyle = css({
	padding: 8,
	flex: '1 1 auto',
	textAlign: 'center',
	color: 'var(--color-2)',
	fontSize: 12,
	transition: 'all 250ms ease-in-out'
})

export default class StyleButton extends Component {
	findIcon = (label, active) => {
		switch (label) {
			case 'Quote':
				return h(BlockQuote, { active })
			case 'Bullets':
				return h(BulletedList, { active })
			case 'Numbers':
				return h(Numbers, { active })
			case 'Code':
				return h(Code, { active })
			case 'Bold':
				return h(Bold, { active })
			case 'Italic':
				return h(Italic, { active })
			case 'Underline':
				return h(Underline, { active })
			case 'Mono':
				return h(Mono, { active })
			default:
				return h(Label, { label, active })
		}
	}

	onToggle = e => {
		e.preventDefault()
		this.props.onToggle(this.props.style)
	}

	render() {
		const { active, label } = this.props

		return (
			<InlineBlock className={css(btnStyle)} onMouseDown={this.onToggle}>
				{this.findIcon(label, active)}
			</InlineBlock>
		)
	}
}
