import React from 'react'

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
			<div className={night ? 'NightMode' : null}>
				<button onClick={this.onChange}>Turn Night Mode {night ? 'Off' : 'On'}</button>
				{this.props.children}
			</div>
		)
	}
}
