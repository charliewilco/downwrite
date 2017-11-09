import React, { Component } from 'react'
import { Header, Nav, Aux } from './'

export default class extends Component {
	static displayName = 'ApplicationLayout'

	static defaultProps = {
		navOpen: false
	}

	state = {
		open: this.props.navOpen
	}

	openNav = () =>
		this.setState(({ open }) => {
			return { open: !open }
		})

	render() {
		return (
			<Aux>
				<Header name="Downwrite" onClick={this.openNav} />
				{this.state.open && <Nav />}
			</Aux>
		)
	}
}
