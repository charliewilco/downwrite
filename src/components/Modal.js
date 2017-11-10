import React from 'react'
import { Flex, Block, Row } from 'glamor/jsxstyle'
import { css, keyframes } from 'glamor'
import { Wrapper } from './'

const modalCloseButton = css({
	position: 'absolute',
	right: 16,
	top: 16,
	border: 0,
	background: 'none',
	appearance: 'none',
	display: 'block',
	margin: 0
})

const fadein = keyframes({
	'0%': { transform: 'translate(0, 75%)', opacity: 0 },
	'100%': { transform: 'translate(0, 0)', opacity: 1 }
})

const ModalCloseIcon = () => (
	<svg width="12" height="12" viewBox="0 0 12 12" style={{ display: 'block' }}>
		<title>Close</title>
		<g id="Canvas" transform="translate(-1561 -730)">
			<g id="Close">
				<g id="Combined Shape">
					<use xlinkHref="#modalClose" transform="translate(1561 730)" fill="#4382A1" />
				</g>
			</g>
		</g>
		<defs>
			<path
				id="modalClose"
				fillRule="evenodd"
				d="M 6.70588 6L 12 0.705882L 11.2941 0L 6 5.29412L 0.705882 2.83725e-14L 0 0.705882L 5.29412 6L 0 11.2941L 0.705882 12L 6 6.70588L 11.2941 12L 12 11.2941L 6.70588 6Z"
			/>
		</defs>
	</svg>
)

const Overlay = props => (
	<Flex
		zIndex={999}
		justifyContent="center"
		alignItems="center"
		flexDirection="Column"
		backgroundColor="rgba(21, 69, 93, 0.125)"
		width="100%"
		backgroundBlendMode="multiply"
		{...props}
	/>
)

// TODO: Remove scrolling on open

export default class extends React.Component {
	componentWillMount() {
		document.body.classList.add('__modalOpen')
	}

	componentWillUnmount() {
		document.body.classList.remove('__modalOpen')
	}

	render() {
		return (
			<Overlay position="fixed" top={0} bottom={0}>
				<Wrapper
					animation={`${fadein} .45s`}
					background="white"
					width="100%"
					height="50%"
					position="relative">
					<Flex flexDirection="column" justifyContent="center">
						<button onClick={this.props.closeUIModal} className={css(modalCloseButton)}>
							<ModalCloseIcon />
						</button>

						<Row alignItems="center" justifyContent="space-between">
							{this.props.children}
						</Row>
					</Flex>
				</Wrapper>
			</Overlay>
		)
	}
}
