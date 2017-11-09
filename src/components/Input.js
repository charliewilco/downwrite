import React from 'react'
import { css } from 'glamor'

let styles = css({
	display: 'block',
	width: '100%',
	appearance: 'none',
	fontWeight: 700,
	fontSize: '125%',
	borderWidth: 0,
	borderBottom: 1,
	borderStyle: 'solid',
	borderRadius: 0,
	borderColor: 'rgba(0, 0, 0, .125)',
	padding: 16
})

export default class Input extends React.Component {
	static defaultProps = {
		type: 'text'
	}

	render() {
		const { onChange, type, inputRef, ...args } = this.props

		return (
			<input
				className={css(styles)}
				ref={inputRef}
				onChange={onChange}
				{...args}
			/>
		)
	}
}
