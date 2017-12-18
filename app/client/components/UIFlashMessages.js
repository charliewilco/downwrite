import React from 'react'
import { Flex, Block } from 'glamor/jsxstyle'
import { css } from 'glamor'
import { CloseIcon as Close, Toggle, Aux } from './'

export const withUIFlash = Component => {
	return class extends React.Component {
		static displayName = `withUIFlash(${Component.displayName || Component.name})`
		state = {
			content: '',
			type: ''
		}

		setFlash = (content: string, type: string) => this.setState({ content, type })

		render() {
			const { content, type } = this.state
			return (
				<Toggle>
					{(open, toggle, close) => (
						<Aux>
							{content.length > 0 && (
								<UIFlash
									type={type}
									content={content}
									onClose={() => this.setState({ content: '', type: '' }, close())}
								/>
							)}
							<Component
								setFlash={this.setFlash}
								toggleUIFlash={toggle}
								openUIFlash={open}
								{...this.props}
							/>
						</Aux>
					)}
				</Toggle>
			)
		}
	}
}

const closeAlert = css({
	appearance: 'none',
	border: 0,
	color: 'inherit'
})

const UIFlash = ({ width = 512, onClose, content, type }) => (
	<Flex
		borderLeft="5px solid rgba(0, 0, 0, .25)"
		boxShadow="0 0 2px rgba(0,0,0,.07), 0 2px 4px rgba(0,0,0,.12)"
		zIndex={900}
		maxWidth={width}
		left={0}
		right={0}
		background="var(--color-6)"
		color="var(--text)"
		position="fixed"
		top={20}
		margin="auto"
		textAlign={!onClose && 'center'}
		paddingTop={8}
		paddingRight={16}
		paddingBottom={8}
		paddingLeft={16}>
		<Block flex={1}>
			{type && `${type.length > 0 && type.toUpperCase()}:`} {content}
		</Block>
		{onClose && (
			<button className={css(closeAlert)} onClick={onClose}>
				<Close fill="currentColor" />
			</button>
		)}
	</Flex>
)

export default UIFlash

// TODO: This needs a few tests and these functions need to be documented

//
/*
	Should this component wrap every route?
	Will need these props available at the top level of every Route for sure
	will need a type of Flash Message
	<UIFlashContainer>
		<App
			message='' String
			revealMessage={fn()}
			dismissMessage={fn()}
		/>
	</UIFlash>
*/
