import React, { Component } from 'react'
import { Block } from 'glamor/jsxstyle'
import { Input } from './components'

class Register extends Component {
	state = {
		data: undefined,
		username: '',
		password: '',
		email: ''
	}

	onSubmit = async evt => {
		evt.preventDefault()
		const { setAuth, cookies } = this.props

		const body = JSON.stringify({
			username: this.state.username,
			password: this.state.password,
			email: this.state.email
		})

		const response = await fetch('http://localhost:4411/users', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body
		})

		const user = await user.json()
		console.log(user)
		cookies.set('token', user.id_token)
		cookies.set('id', user.userID)
		setAuth(user)
	}

	render() {
		const { username, password, email } = this.state
		return (
			<Block>
				<Block padding={16} maxWidth={544} background="white" margin="32px auto" width="95%">
					<form onSubmit={this.onSubmit}>
						<h1 className="h6 u-mb4">Register for Downwrite</h1>
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

export default Register
