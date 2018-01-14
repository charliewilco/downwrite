// @flow

import * as React from 'react'
import { css } from 'glamor'

const lbtnStyle = css({
	padding: 8,
	color: `var(--color-6)`,
	border: 0,
	background: 'none',
	fontFamily: 'inherit',
	fontWeight: 700,
	fontStyle: 'italic',
	':hover': {
		color: `var(--color-7)`
	}
})

export default class extends React.Component<{ onClick: Function, label: string }, void> {
	static displayName = 'LoginButton'

	static defaultProps = {
		label: 'Submit'
	}

	render() {
		const { label, onClick } = this.props
		return (
			<button className={css(lbtnStyle)} onClick={onClick}>
				{label}
			</button>
		)
	}
}
