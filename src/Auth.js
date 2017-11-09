import { Component } from 'react'
import { TOKEN, USER_ID, signOut, signIn } from './utils/cookie'

// This component should passdown the state of authed from withAuthCheck() HOC
// There is only one single point of state that needs to be rendered

// One other pattern we could consider is passing down user and token as state
// and login and logout functions from authed. this would allow an initial check
// of the cookie on a refresh and as the user is logged in have an updated source of the token
// this would solve that single point of state to be updated.
// We would pass down signIn and signOut to <Login /> & <Register />

/*
	<Auth>
		{(authed, login, logout, token, user) => <App {...args} />}
	</Auth>
*/

export default class Auth extends Component {
	state = {
		authed: false,
		token: TOKEN,
		user: USER_ID
	}

	componentWillMount() {
		this.setState(({ token }) => {
			return {
				authed: token !== undefined && token !== 'undefined'
			}
		})
	}


	signIn = (authed, token, user) => this.setState({ authed, token, user }, signIn(token, user))

	signOut = () => this.setState({
		authed: false,
		token: undefined,
		user: undefined
	}, signOut())

	render() {
		return this.props.children(
			this.state.authed,
			this.state.token,
			this.state.user,
			this.signIn,
			this.signOut
		)
	}
}
