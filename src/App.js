// @flow
import * as React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import Media from 'react-media'
import { Block } from 'glamor/jsxstyle'
import Loadable from 'react-loadable'
import { Header, Nav, Toggle } from './components'
import { PrivateRoute } from './CustomRoutes'

type AppProps = {
	authed: boolean,
	token: string,
	user: string,
	name: string,
	signIn: Function,
	signOut: Function
}

const Loading = () => {
	return <h1>Loading</h1>
}

const New = Loadable({
	loader: () => import('./New'),
	loading: Loading
})

const Edit = Loadable({
	loader: () => import('./Edit'),
	loading: Loading
})

const Home = Loadable({
	loader: () => import('./Home'),
	loading: Loading
})

const Main = Loadable({
	loader: () => import('./Main'),
	loading: Loading
})

const NotFound = Loadable({
	loader: () => import('./NoMatch'),
	loading: Loading
})

const SignOut = Loadable({
	loader: () => import('./SignOut'),
	loading: Loading
})

const Preview = Loadable({
	loader: () => import('./Preview'),
	loading: Loading
})

export default class extends React.Component<AppProps, void> {
	static displayName = 'AppRouterContainer'

	render() {
		const { authed, token, user, name, signOut, signIn } = this.props
		return (
			<Router>
				<Media query={{ minWidth: 500 }}>
					{matches => (
						<Toggle>
							{(navOpen, toggleNav, closeNav) => (
								<Block minHeight="100%" fontFamily="var(--primary-font)">
									<Block height="100%" className="u-cf">
										<Block
											minHeight="100%"
											float={navOpen && matches && 'left'}
											width={navOpen && matches && 'calc(100% - 384px)'}>
											<Header
												name="Downwrite"
												authed={authed}
												open={navOpen}
												onClick={toggleNav}
											/>

											<Switch>
												<Route
													exact
													path="/"
													render={(props: Object) =>
														authed === true ? (
															<Main closeNav={closeNav} token={token} user={user} {...props} />
														) : (
															<Home {...props} signIn={signIn} signOut={signOut} />
														)
													}
												/>

												<PrivateRoute
													authed={authed}
													token={token}
													user={user}
													path="/new"
													component={New}
												/>
												<PrivateRoute
													authed={authed}
													token={token}
													user={user}
													path="/:id/edit"
													component={Edit}
												/>
												<Route exact path="/:id/preview" component={Preview} />
												<Route
													exact
													path="/signout"
													render={(props: Object) => (
														<SignOut toggleNav={toggleNav} signOut={signOut} />
													)}
												/>
												<Route component={NotFound} />
											</Switch>
										</Block>
										{navOpen && (
											<Nav
												closeNav={closeNav}
												matches={matches}
												token={token}
												user={user}
												username={name}
											/>
										)}
									</Block>
								</Block>
							)}
						</Toggle>
					)}
				</Media>
			</Router>
		)
	}
}
