import React, { Component } from 'react'
import { Header, Nav, Aux } from './'

export class extends Component {
	static displayName = 'ApplicationLayout'

	static defaultProps = {
		navOpen: false
	}

	state = {
		open: this.props.navOpen
	}

	render() {
		return (
			<Aux>
				<Header name="Downwrite" />
				{
					this.state.open && (
						<Nav />
					)
				}
			</Aux>
		)
	}
}
