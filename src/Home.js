// @flow
import React, { Component } from 'react'
import { withCookies, Cookies } from 'react-cookie'
import Login from './Login'
import Register from './Register'
import { Block, Flex } from 'glamor/jsxstyle'
import { css } from 'glamor'

const hStyle = css({
	marginBottom: 16,
	textAlign: 'center',
	fontSize: 18
})

const navStyle = css({
	width: '50%',
	border: 0,
	appearance: 'none',
	borderRadius: 0,
	fontFamily: 'var(--secondary-font)',
	borderBottomWidth: 3,
	borderBottomStyle: 'solid',
	paddingTop: 16,
	paddingBottom: 16,
	borderBottomColor: 'transparent'
})

const navStyleAction = css({
	color: `var(--color-6)`,
	borderBottomColor: `var(--color-6)`
})

class Home extends Component<void, { loginSelected: boolean }> {
	state = {
		loginSelected: true
	}

	render() {
		const { loginSelected } = this.state
		return (
			<Block
				boxShadow="0 0 2px rgba(0,0,0,.07), 0 2px 4px rgba(0,0,0,.12)"
				maxWidth={544}
				background="white"
				margin="32px auto"
				width="95%">
				<Flex>
					<button
						className={css(loginSelected ? [navStyle, navStyleAction] : navStyle)}
						onClick={() => this.setState({ loginSelected: true })}>
						Login
					</button>
					<button
						className={css(!loginSelected ? [navStyle, navStyleAction] : navStyle)}
						onClick={() => this.setState({ loginSelected: false })}>
						Register
					</button>
				</Flex>
				<Block padding={16}>
					<h1 className={css(hStyle)}>{loginSelected ? 'Login' : 'Register'}</h1>
					{loginSelected ? <Login {...this.props} /> : <Register {...this.props} />}
				</Block>
			</Block>
		)
	}
}

export default withCookies(Home)
