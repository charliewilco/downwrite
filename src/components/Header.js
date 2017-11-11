import React from 'react'
import { Link } from 'react-router-dom'
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
	},
	toggleButton: {
		appearance: 'none',
		outline: 'none',
		border: 0,
		background: 'none'
	}
}

export default ({ name, onClick, open }) => (
	<Row component="header" alignItems="center" justifyContent="space-between" padding={16}>
		<Flex alignItems="center">
			<Logo />
			<Link className={css(hSty.link)} to="/">
				<h1 className={css(hSty.title)} children={name} />
			</Link>
		</Flex>
		<button onClick={onClick} className={css(hSty.toggleButton)}>
			<svg width="20px" height="9px" viewBox="0 0 20 9">
				<desc>Navicon</desc>
				<g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
					<g fill={open ? "#65A3BF": "#4C4C4C"}>
						<rect id="Rectangle-Copy-3" x="0" y="0" width="20" height="1" />
						<rect id="Rectangle-Copy-4" x={open ? 0 : 10} y="4" width={open ? 20 : 10} height="1" />
						<rect id="Rectangle-Copy-5" x={open ? 0 : 5} y="8" width={open ? 20 : 15} height="1" />
					</g>
				</g>
			</svg>
		</button>
	</Row>
)
