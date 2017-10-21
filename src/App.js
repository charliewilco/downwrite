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
import { PublicRoute, PrivateRoute } from './CustomRoutes'
import { withCookies, Cookies } from 'react-cookie'

class App extends React.Component<{ cookies: typeof Cookies }, { authed: boolean }> {
	state = {
		authed: false
	}

	componentWillMount() {
		const token: Function = this.props.cookies.get('token')

		this.setState({
			authed: token !== undefined
		})
	}

	setAuth = (authed: boolean) => {
		return this.setState({ authed })
	}

	signOut = () => {
		const rmToken: Function = this.props.cookies.remove('token')
		return this.setState({ authed: false }, rmToken())
	}

	render() {
		const { authed } = this.state
		return (
			<Router>
				<Block fontFamily="var(--primary-font)" height="calc(100% - 82px)">
					<Header name="Downwrite" />
					<Switch>
						<Route exact path="/">
							{authed === true ? <Main /> : <Home setAuth={this.setAuth} />}
						</Route>
						<PrivateRoute auth={authed} path="/new" component={NewPost} />
						<Route path="/:id/edit" component={EditPost} />
						<Route component={NoMatch} />
					</Switch>
					{authed && (
						<footer>
							<button onClick={() => this.signOut()}>Sign Out</button>
						</footer>
					)}
				</Block>
			</Router>
		)
	}
}

export default withCookies(App)
