import React, { Component } from 'react'
import { Block } from 'glamor/jsxstyle'
import { Input } from './components'
import { Redirect } from 'react-router-dom'

const creds = {
	username: 'charlespeters',
	email: 'charlespeters42@gmail.com',
	password: 'wedontexist'
}

class Login extends Component {
	state = {
		data: undefined,
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
			body: JSON.stringify({
				username: this.state.username,
				email: this.state.email,
				password: this.state.password
			})
		})

		const auth = await authRequest.json()
		cookies.set('token', auth.id_token)
		cookies.set('id', auth.userID)
		this.props.setAuth(auth.id_token)
	}

	render() {
		const { authed, username, password, email } = this.state
		return (
			<Block>
				<Block padding={16} maxWidth={544} background="white" margin="32px auto" width="95%">
					<form onSubmit={this.onSubmit}>
						<h1 className="h6 u-mb4">Login</h1>
						<label>
							<Input
								value={username}
								onChange={e => this.setState({ username: e.target.value })}
							/>
							<span>Username</span>
						</label>
						<label>
							<Input value={email} onChange={e => this.setState({ email: e.target.value })} />
							<span>Email</span>
						</label>
						<label>
							<Input
								value={password}
								type="password"
								onChange={e => this.setState({ password: e.target.value })}
							/>
							<span>Password</span>
						</label>
						<Block paddingTop={16} textAlign="right">
							<button onClick={this.onSubmit}>Submit</button>
						</Block>
					</form>
				</Block>
			</Block>
		)
	}
}

export default Login
