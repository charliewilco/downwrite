import React from 'react'
import { Redirect } from 'react-router-dom'

export default class SignOut extends React.Component {
	componentWillMount() {
		this.props.signOut()
		this.props.toggleNav()
	}

	render() {
		return (
			<Redirect to={{ pathname: '/', state: { from: this.props.location, authed: false } }} />
		)
	}
}
