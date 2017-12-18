import React from 'react'
import { Block, Flex } from 'glamor/jsxstyle'
import Link from 'next/link'
import Router from 'next/router'
import { css, keyframes } from 'glamor'
import Wrapper from './Wrapper'
import Button from './Button'

const backNForth = keyframes({
	'0%': { transform: 'translate(0, 0)' },
	'50%': { transform: 'translate(calc(512px - 60px), 0)' },
	'100%': { transform: 'translate(0, 0)' }
})

const nibAni = css({
	display: 'block',
	transform: 'translate(0, 0)',
	animation: `${backNForth} 7s infinite`
})

const nibContainer = css({
	'::after': {
		content: '""',
		marginTop: 8,
		width: '100%',
		height: 4,
		display: 'block',
		backgroundImage: 'linear-gradient(#4FA5C2, #185A70)'
	}
})

const Nib = () => (
	<div className={css(nibContainer)}>
		<svg className={css(nibAni)} width="60" height="71" viewBox="0 0 60 71">
			<title>Nib</title>
			<g id="Canvas" transform="translate(-353 36)">
				<g id="Nib">
					<g id="Shape">
						<use
							xlinkHref="#path0_fill"
							transform="matrix(0.866025 0.5 -0.5 0.866025 398.621 -27.8143)"
							fill="url(#paint0_radial)"
						/>
					</g>
					<g id="Shape">
						<use
							xlinkHref="#path1_fill"
							transform="matrix(0.866025 0.5 -0.5 0.866025 384.765 -35.8143)"
							fill="url(#paint1_radial)"
						/>
					</g>
				</g>
			</g>
			<defs>
				<radialGradient
					id="paint0_radial"
					cx="0.5"
					cy="0.5"
					r="0.5"
					gradientUnits="userSpaceOnUse"
					gradientTransform="matrix(46.0248 0 0 179.743 -15.0124 -58.6288)">
					<stop offset="0" stopColor="#FFCE00" />
					<stop offset="0.1639" stopColor="#FFD600" />
					<stop offset="0.579" stopColor="#FFE600" />
					<stop offset="1" stopColor="#FFCE00" />
				</radialGradient>
				<radialGradient
					id="paint1_radial"
					cx="0.5"
					cy="0.5"
					r="0.5"
					gradientUnits="userSpaceOnUse"
					gradientTransform="matrix(46.0248 0 0 179.742 -15.0124 -58.6282)">
					<stop offset="0" stopColor="#FFB600" />
					<stop offset="0.5249" stopColor="#FFC200" />
					<stop offset="1" stopColor="#F4A903" />
				</radialGradient>
				<path
					id="path0_fill"
					fillRule="evenodd"
					d="M 0 0L 0 40.7006C 1.90351 40.7006 3.4466 42.2289 3.4466 44.1141C 3.4466 45.9993 1.90351 47.5276 0 47.5276L 0 62.4857L 16 47.29L 0 0L 0 0Z"
				/>
				<path
					id="path1_fill"
					fillRule="evenodd"
					d="M 12.5534 44.1141C 12.5534 42.2289 14.0965 40.7006 16 40.7006L 16 0L 0 47.2896L 16 62.4853L 16 47.5272C 14.0965 47.5276 12.5534 45.9993 12.5534 44.1141L 12.5534 44.1141Z"
				/>
			</defs>
		</svg>
	</div>
)

export const SidebarEmpty = () => (
	<Flex justifyContent="center">
		<Button onClick={() => Router.push('/new')}>Get Started</Button>
	</Flex>
)

export default () => (
	<Wrapper paddingTop={64}>
		<Flex>
			<Block flex={1} marginRight={16}>
				<Nib />
			</Block>
			<Block flex={1} marginLeft={16}>
				<h4 className={css({ fontSize: 24, marginBottom: 16 })}>
					Looks like you don't have any entries
				</h4>
				<Link href="/new">
					<a className={css({ color: '#757575' })}>Get Started &rarr;</a>
				</Link>
			</Block>
		</Flex>
	</Wrapper>
)
