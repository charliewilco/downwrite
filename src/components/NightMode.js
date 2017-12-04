import React from 'react'

export default class extends React.Component {
	state = {
		night: false
	}

	componentWillMount() {
		const night = JSON.parse(localStorage.getItem('nightMode')) || false

		console.log(night)

		this.setState({ night: night })
	}

	onChange = () => {
		this.setState(({ night }) => ( { night: !night } ), () => localStorage.setItem('nightMode', this.state.night))
	}

	render() {
		return (
			<div className={this.state.night && 'NightMode'}>
				{this.props.children}
			</div>
		
		)
	}
}
