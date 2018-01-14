// @flow

import * as React from 'react'

import { Block, InlineBlock } from 'glamor/jsxstyle'
import { LoginInput, Button } from './components'
import { USER_ENDPOINT } from './utils/urls'

type RegisterType = {
	username: string,
	password: string,
	email: string
}

type LoginProps = {
	signIn: Function
}

class Register extends React.Component<LoginProps, RegisterType> {
	state = {
		username: '',
		password: '',
		email: ''
	}

	onSubmit = async (evt: Event) => {
		evt.preventDefault()
		const response = await fetch(USER_ENDPOINT, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ ...this.state })
		})

		const user: { userID: string, id_token: string, username: string } = await response.json()

		if (user.userID) {
			this.props.signIn(user.id_token !== undefined, user.id_token, user.userID, user.username)
		}
	}

	render() {
		const { username, password, email } = this.state
		return (
			<form onSubmit={this.onSubmit}>
				<LoginInput
					placeholder="Try for something unique"
					label="Username"
					value={username}
					onChange={({ target }: SyntheticInputEvent<*>) =>
						this.setState({ username: target.value })
					}
				/>

				<LoginInput
					placeholder="mail@email.com"
					label="Email"
					value={email}
					onChange={({ target }: SyntheticInputEvent<*>) =>
						this.setState({ email: target.value })
					}
				/>

				<LoginInput
					placeholder="*********"
					label="Password"
					value={password}
					type="password"
					onChange={({ target }: SyntheticInputEvent<*>) =>
						this.setState({ password: target.value })
					}
				/>

				<Block paddingTop={16} textAlign="right">
					<InlineBlock>
						<Button onClick={this.onSubmit}>Register</Button>
					</InlineBlock>
				</Block>
			</form>
		)
	}
}

export default Register
