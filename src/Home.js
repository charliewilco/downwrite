// @flow
// @jsx createElement
import React, { Component } from 'react'
import Login from './Login'
import Register from './Register'
import { Block, Flex } from 'glamor/jsxstyle'
import { css } from 'glamor'
import { createElement } from 'glamor/react'
import { Logo } from './components'
import oatmeal from './utils/cookie'

const hStyle = css({
	marginBottom: 32,
	textAlign: 'center',
	fontSize: 18,
	fontWeight: 400
})

const navStyle = css({
	width: '50%',
	border: 0,
	appearance: 'none',
	borderRadius: 0,
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

const Intro = () => (
	<Block
		color="var(--color-4)"
		css={{
			textAlign: 'center',
			marginBottom: 32,
			'@media (min-width: 57.75rem)': {
				paddingTop: 144,
				textAlign: 'left',
				marginBottom: 0
			}
		}}>
		<Logo />
		<h1
			data-test='Login Page Container'
			className={css({
				fontSize: 32,
				marginTop: 16,
				marginBottom: 4
			})}>
			Downwrite
		</h1>
		<span>A place to write</span>
	</Block>
)

const Container = ({ children }) => (
	<Flex
		flexWrap="wrap"
		width="95%"
		margin="auto"
		justifyContent="space-around"
		position="absolute"
		top={64}
		left={0}
		right={0}
		children={children}
	/>
)

class Home extends Component<void, { loginSelected: boolean, error: string }> {
	state = {
		loginSelected: false,
		error: ''
	}

	errorMessage = (x: string) => this.setState({ error: x })

	render() {
		const { loginSelected, error } = this.state
		return (
			<Block position="relative">
				<Block className="HomeBanner" />
				<Container>
					<Intro />
					<Block
						boxShadow="0 0 2px rgba(0,0,0,.07), 0 2px 4px rgba(0,0,0,.12)"
						maxWidth={544}
						width="100%"
						background="white">
						<Flex>
							<button
								className={css(!loginSelected ? [navStyle, navStyleAction] : navStyle)}
								onClick={() => this.setState({ loginSelected: false })}>
								Register
							</button>
							<button
								className={css(loginSelected ? [navStyle, navStyleAction] : navStyle)}
								onClick={() => this.setState({ loginSelected: true })}>
								Login
							</button>
						</Flex>
						<Block padding={16}>
							<h2 className={css(hStyle)}>
								{loginSelected ? 'Welcome Back!' : 'Sign Up as  a New User'}
							</h2>
							{
								loginSelected
								? <Login {...this.props} setError={this.errorMessage} cookies={oatmeal} />
								: <Register {...this.props} setError={this.errorMessage} cookies={oatmeal} />
							}
						</Block>
					</Block>
				</Container>
				{error.length > 0 && <span>{error}</span>}
			</Block>
		)
	}
}

export default Home
