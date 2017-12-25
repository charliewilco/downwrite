import React, { Fragment, Component } from 'react'
import { Header, Nav } from './'

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
			<Fragment>
				<Header name="Downwrite" onClick={this.openNav} />
				{this.state.open && <Nav />}
			</Fragment>
		)
	}
}
