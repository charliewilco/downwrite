// @flow
import * as React from 'react'
import uuid from 'uuid/v4'
import { css } from 'glamor'

const styles = {
	container: css({
		display: 'block',
		':not(:last-of-type)': {
			marginBottom: 16
		}
	}),
	label: css({
		textTransform: 'uppercase',
		letterSpacing: 1,
		opacity: 0.5
	}),
	input: css({
		fontFamily: 'var(--secondary-font)',
		appearance: 'none',
		display: 'block',
		border: 0,
		width: '100%',
		borderBottom: `2px solid var(--color-1)`,
		':focus': {
			outline: 'none',
			borderBottom: `2px solid var(--color-6)`
		}
	})
}

type InputType = {
	label: String,
	onChange: Function,
	value: String,
	type: String
}

export default class LoginInput extends React.Component<InputType, void> {
	render() {
		const id = uuid()

		const { label } = this.props
		return (
			<label htmlFor={id} className={css(styles.container)}>
				<input className={css(styles.input)} id={id} {...this.props} />
				<small className={css(styles.label)}>{label}</small>
			</label>
		)
	}
}
