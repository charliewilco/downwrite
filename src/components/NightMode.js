import React from 'react'
import { Block } from 'glamor/jsxstyle'
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
			<Block className={night ? 'NightMode' : null} position="relative">
				<Block
					padding={8}
					boxShadow="0 0 2px rgba(0,0,0,.07), 0 2px 4px rgba(0,0,0,.12)"
					background="white"
					position="absolute">
					<label>
						<Check checked={night} onChange={this.onChange} />
						<span>Turn Night Mode {night ? 'Off' : 'On'}</span>
					</label>
				</Block>
				{this.props.children}
			</Block>
		)
	}
}
