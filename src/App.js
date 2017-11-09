// @flow
import * as React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { Block } from 'glamor/jsxstyle'
import NewPost from './NewPost'
import EditPost from './EditPost'
import { Header } from './components'
import Main from './Main'
import NoMatch from './NoMatch'
import Home from './Home'
import SignOut from './SignOut'
import { PrivateRoute } from './CustomRoutes'

type AppProps = {
	token: String,
	user: String,
	signOut: Function
}

class App extends React.Component<AppProps, { authed: boolean }> {
	state = {
		authed: false
	}

	componentWillMount() {
		const { token } = this.props
		this.setState({
			authed: token !== undefined && token !== 'undefined'
		})
	}

	setAuth = (authed: boolean) => {
		return this.setState({ authed })
	}

	signOut = () => {
		return this.setState({ authed: false }, this.props.signOut())
	}

	render() {
		const { authed } = this.state
		return (
			<Router>
				<Block fontFamily="var(--primary-font)" height="calc(100% - 82px)">
					{authed && <Header signOut={this.signOut} name="Downwrite" />}
					<Switch>
						<Route
							exact
							path="/"
							render={(props: Object) =>
								authed === true ? (
									<Main user={this.props.user} token={this.props.token} {...props} />
								) : (
									<Home {...props} setAuth={this.setAuth} />
								)}
						/>
						<PrivateRoute authed={authed} path="/new" component={NewPost} />
						<PrivateRoute authed={authed} path="/:id/edit" component={EditPost} />
						<Route
							path="/signout"
							render={(props: Object) => <SignOut signOut={this.signOut} />}
						/>
						<Route component={NoMatch} />
					</Switch>
				</Block>
			</Router>
		)
	}
}

export default App
