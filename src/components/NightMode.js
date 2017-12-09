import React from 'react'
import { Flex, Block } from 'glamor/jsxstyle'
import Check from './Checkbox'

export default class extends React.Component {
	state = {
		night: false
	}

	componentWillMount() {
		// TODO: there should be a better:
		const night = JSON.parse(localStorage.getItem('nightMode')) || false

		this.setState({ night: night })
	}

	setNight = status => localStorage.setItem('nightMode', status)

	onChange = () => {
		this.setState(({ night }) => {
			this.setNight(!night)
			return { night: !night }
		})
	}

	render() {
		const { night } = this.state
		return (
			<Block className={night ? 'NightMode' : null} minHeight="100%" position="relative">
				<Block
					color="var(--text)"
					padding={8}
					margin={16 * 2}
					boxShadow="0 0 2px rgba(0,0,0,.07), 0 2px 4px rgba(0,0,0,.12)"
					background="white"
					bottom={0}
					position="fixed">
					<Flex alignItems="center" component="label">
						<Check checked={night} onChange={this.onChange} />
						<small style={{ marginLeft: 8 }}>Night Mode is {!night ? 'Off' : 'On'}</small>
					</Flex>
				</Block>
				<Block>{this.props.children}</Block>
			</Block>
		)
	}
}
