// @flow

import React, { Component } from 'react'
import { Block } from 'glamor/jsxstyle'
import { LoginInput as Input, LoginButton } from './components'

type RegisterType = {
	username: string,
	password: string,
	email: string
}

class Register extends Component<{ setAuth: Function, cookies: Object }, RegisterType> {
	state = {
		username: '',
		password: '',
		email: ''
	}

	onSubmit = async (evt: Event) => {
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

		const user = await response.json()
		cookies.set('token', user.id_token)
		cookies.set('id', user.userID)
		setAuth(user)
	}

	render() {
		const { username, password, email } = this.state
		return (
			<form onSubmit={this.onSubmit}>
				<Input
					label="Username"
					value={username}
					onChange={e => this.setState({ username: e.target.value })}
				/>

				<Input
					label="Email"
					value={email}
					onChange={e => this.setState({ email: e.target.value })}
				/>

				<Input
					label="Password"
					value={password}
					type="password"
					onChange={e => this.setState({ password: e.target.value })}
				/>

				<Block paddingTop={16} textAlign="right">
					<LoginButton label="Register" onClick={this.onSubmit} />
				</Block>
			</form>
		)
	}
}

export default Register
