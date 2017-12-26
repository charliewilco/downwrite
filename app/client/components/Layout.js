import React, { Fragment, Component } from 'react'
import { Block } from 'glamor/jsxstyle'
import Head from 'next/head'
import { Header, Nav } from './'

export default class extends Component {
	static displayName = 'Layout'

	static defaultProps = {
		navOpen: false
	}

	state = {
		open: this.props.navOpen
	}

	render() {
		return (
			<Fragment>
				<Head>
					<title>{this.props.title}</title>
				</Head>
				<Block>
					<Header
						onClick={() => this.setState(({ open }) => ({ open: !open }))}
						authed={this.props.token !== undefined}
					/>
					{this.props.children}
				</Block>
				{this.state.open && (
					<Nav
						closeNav={() => this.setState({ open: false })}
						username={this.props.username}
						token={this.props.token}
					/>
				)}
			</Fragment>
		)
	}
}
