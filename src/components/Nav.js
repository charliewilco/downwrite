import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { css } from 'glamor'
import { Block } from 'glamor/jsxstyle'

const navButton = css({
	'&:hover': {
		color: 'var(--color-2)'
	},
	'& + &': {
		marginLeft: 16
	}
})

export default class extends Component {
	static defaultProps = {
		open: true
	}

	render() {
		return (
			<nav>
				<Block backgroundColor="white">
					<Link to="/new" className={css(navButton)}>
						New
					</Link>

					<Link to="/signout" className={css(navButton)}>
						Sign Out
					</Link>
				</Block>
			</nav>
		)
	}
}
