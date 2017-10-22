// @flow

import * as React from 'react'
import { Block } from 'glamor/jsxstyle'
import { LoginInput, LoginButton } from './components'

const creds = {
	username: 'charlespeters',
	email: 'charlespeters42@gmail.com',
	password: 'wedontexist'
}

type LoginState = {
	username: string,
	email: string,
	password: string
}

class Login extends React.Component<void, LoginState> {
	state = {
		username: '',
		email: '',
		password: ''
	}

	componentWillMount() {
		this.setState({ ...creds })
	}

	onSubmit = async evt => {
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
		cookies.set('token', auth.id_token)
		cookies.set('id', auth.userID)
		this.props.setAuth(auth.id_token.length > 0)
	}

	render() {
		const { username, password, email } = this.state
		return (
			<form onSubmit={this.onSubmit}>
				<LoginInput
					label="Username"
					value={username}
					onChange={e => this.setState({ username: e.target.value })}
				/>
				<LoginInput
					label="Email"
					value={email}
					onChange={e => this.setState({ email: e.target.value })}
				/>
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
