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

class App extends React.Component<{ cookies: Cookies }, { authed: boolean }> {
	state = {
		authed: false
	}

	componentWillMount() {
		const { cookies } = this.props
		const token = cookies.get('token')

		this.setState({
			authed: token !== undefined
		})
	}

	setAuth = (authed: boolean) => {
		return this.setState({ authed })
	}

	render() {
		const { authed } = this.state
		return (
			<Router>
				<Block fontFamily="var(--primary-font)" height="calc(100% - 82px)">
					<Header name="Downwrite" />
					<Switch>
						<Route exact path="/">
							{authed ? <Main /> : <Home setAuth={this.setAuth} />}
						</Route>
						<PrivateRoute auth={authed} path="/" component={Main} />
						<PrivateRoute auth={authed} path="/new" component={NewPost} />
						<Route path="/:id/edit" component={EditPost} />
						<Route component={NoMatch} />
					</Switch>
				</Block>
			</Router>
		)
	}
}

export default withCookies(App)
