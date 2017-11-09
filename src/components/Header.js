import React from 'react'
import { Link } from 'react-router-dom'
import Nav from './Nav'
import Logo from './Logo'
import { css } from 'glamor'
import { Flex, Row } from 'glamor/jsxstyle'

const hSty = {
	link: css({
		marginLeft: 12,
		display: 'block',
		transition: 'color 375ms ease-in-out',
		'&:hover': {
			color: `var(--color-2)`
		}
	}),
	title: {
		fontSize: 16,
		fontStyle: 'normal',
		lineHeight: 1,
		fontWeight: 500,
		'@media (min-width: 57.75rem)': {
			fontSize: 20
		}
	}
}

const Header = ({ name }) => (
	<Row component="header" alignItems="center" justifyContent="space-between" padding={16}>
		<Flex alignItems="center">
			<Logo />
			<Link className={css(hSty.link)} to="/">
				<h1 className={css(hSty.title)} children={name} />
			</Link>
		</Flex>
		<Nav />
	</Row>
)

export default Header
