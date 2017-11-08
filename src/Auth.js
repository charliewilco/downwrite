import { Component } from 'react'
import { TOKEN, USER_ID, signOut } from './utils/cookie'


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

	signIn = (authed, token, user) => this.setState({ authed, token, user })

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
