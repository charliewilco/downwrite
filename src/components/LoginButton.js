// @flow

import * as React from 'react'
import { css } from 'glamor'

const lbtnStyle = css({
	background: `var(--color-6)`,
	border: 0,
	fontFamily: 'var(--secondary-font)',
	':hover': {
		background: `var(--color-7)`
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
