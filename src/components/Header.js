// @flow

import React from 'react'
import { Link } from 'react-router-dom'
import Logo from './Logo'
import { css } from 'glamor'
import { Flex, Row } from 'glamor/jsxstyle'

const hdr: Object = {
	link: css({
		marginLeft: 12,
		display: 'block',
		transition: 'color 375ms ease-in-out',
		'&:hover': {
			color: `var(--color-2)`
		}
	}),
	title: css({
		fontSize: 16,
		fontStyle: 'normal',
		lineHeight: 1,
		fontWeight: 500,
		'@media (min-width: 57.75rem)': {
			fontSize: 20
		}
	}),
	new: css({
		fontSize: 14,
		lineHeight: 1.1,
		opacity: 0.5,
		color: 'var(--text)',
		marginRight: 32,
		'&:hover, &:focus': {
			color: 'var(--text)',
			opacity: 1
		}
	}),
	toggleButton: css({
		appearance: 'none',
		outline: 'none',
		border: 0,
		background: 'none'
	})
}

type Header = {
	name: string,
	onClick: Function,
	open: boolean
}

export default ({ name, onClick, open }: Header) => (
	<Row
		component="header"
		alignItems="center"
		justifyContent="space-between"
		paddingTop={16}
		paddingBottom={16}
		paddingLeft={8}
		paddingRight={8}>
		<Flex alignItems="center">
			<Logo />
			<Link className={css(hdr.link)} to="/">
				<h1 className={css(hdr.title)} children={name} />
			</Link>
		</Flex>
		<Flex alignItems="center">
			<Link to="/new" className={css(hdr.new)}>
				New
			</Link>
			<button onClick={onClick} className={css(hdr.toggleButton)}>
				<svg width="20px" height="9px" viewBox="0 0 20 9">
					<desc>Navicon</desc>
					<g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
						<g fill={open ? '#65A3BF' : '#4C4C4C'}>
							<rect id="Rectangle-Copy-3" x="0" y="0" width="20" height="1" />
							<rect
								id="Rectangle-Copy-4"
								x={open ? 0 : 10}
								y="4"
								width={open ? 20 : 10}
								height="1"
							/>
							<rect
								id="Rectangle-Copy-5"
								x={open ? 0 : 5}
								y="8"
								width={open ? 20 : 15}
								height="1"
							/>
						</g>
					</g>
				</svg>
			</button>
		</Flex>
	</Row>
)
