// @flow

import * as React from 'react'
import { Block } from 'glamor/jsxstyle'
import { LoginInput, LoginButton } from './components'
import { Cookies } from 'react-cookie'

const creds = {
	user: 'charlespeters',
	password: 'wedontexist'
}

type LoginState = {
	user: string,
	password: string
}

class Login extends React.Component<
	{ setAuth: Function, cookies: typeof Cookies },
	LoginState
> {
	state = {
		user: '',
		password: ''
	}

	componentWillMount() {
		this.setState({ ...creds })
	}

	onSubmit = async (evt: Event) => {
		evt.preventDefault()

		const { setAuth, cookies } = this.props
		const authRequest = await fetch('http://localhost:4411/users/authenticate', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ ...this.state })
		})

		const auth = await authRequest.json()
		console.log(auth, auth.id_token)

		if (auth.userID) {
			cookies.set('token', auth.id_token)
			cookies.set('id', auth.userID)
		}

		setAuth(auth.id_token !== undefined)
	}

	render() {
		const { user, password /* email */ } = this.state
		return (
			<form onSubmit={this.onSubmit}>
				<LoginInput
					label="Username or Email"
					value={user}
					onChange={e => this.setState({ user: e.target.value })}
				/>
				{/* <LoginInput
					label="Email"
					value={email}
					onChange={e => this.setState({ email: e.target.value })}
				/> */}
				<LoginInput
					label="Password"
					value={password}
					type="password"
					onChange={e => this.setState({ password: e.target.value })}
				/>
				<Block paddingTop={16} textAlign="right">
					<LoginButton label="Login" onClick={this.onSubmit} />
				</Block>
			</form>
		)
	}
}

export default Login
