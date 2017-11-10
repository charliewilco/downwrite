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
	}
}

export default ({ name, onClick }) => (
	<Row component="header" alignItems="center" justifyContent="space-between" padding={16}>
		<Flex alignItems="center">
			<Logo />
			<Link className={css(hSty.link)} to="/">
				<h1 className={css(hSty.title)} children={name} />
			</Link>
		</Flex>
		<button onClick={onClick}>
			<svg width="19" height="11" viewBox="0 0 19 11">
				<title>Navicon</title>
				<g id="Canvas" transform="translate(-1877 522)">
					<rect x="1877" y="-522" width="19" height="11" fill="#185A70"/>
					<clipPath id="clip-0" clipRule="evenodd">
						<path d="M 632 -556L 1912 -556L 1912 456L 632 456L 632 -556Z" fill="#FFFFFF"/>
					</clipPath>
					<g id="Editor Empty" clipPath="url(#clip-0)">
						<path d="M 632 -556L 1912 -556L 1912 456L 632 456L 632 -556Z" fill="#F9FBFC"/>
						<g id="Header">
							<g id="Navicon">
								<use xlinkHref="#path0_fill" transform="translate(1877 -522)" fill="#4C4C4C"/>
							</g>
						</g>
					</g>
				</g>
				<defs>
					<path id="path0_fill" fillRule="evenodd" d="M 19 0L 0 0L 0 0.7677L 19 0.7677L 19 0ZM 9.5 4.79797L 19 4.79797L 19 5.56567L 9.5 5.56567L 9.5 4.79797ZM 4.75 9.59595L 19 9.59595L 19 10.3636L 4.75 10.3636L 4.75 9.59595Z"/>
				</defs>
			</svg>
		</button>
	</Row>
)
