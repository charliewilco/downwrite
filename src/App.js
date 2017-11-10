// @flow
import * as React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { Block } from 'glamor/jsxstyle'
import New from './New'
import Edit from './Edit'
import { Header, Nav, Aux, Toggle } from './components'
import Main from './Main'
import Home from './Home'
import NoMatch from './NoMatch'
import SignOut from './SignOut'
import { PrivateRoute } from './CustomRoutes'

type AppProps = {
	authed: boolean,
	token: string,
	user: string,
	name: string,
	signIn: Function,
	signOut: Function
}

export default class extends React.Component<AppProps, void> {
	static displayName = 'AppRouterContainer'

	render() {
		const { authed, token, user, name, signOut, signIn } = this.props
		return (
			<Router>
				<Toggle>
					{
						(navOpen, toggleNav) => (
							<Block  fontFamily="var(--primary-font)">

							<Block height="calc(100% - 82px)" className='u-cf'>

								<Block float={navOpen && 'left'}  width={navOpen && 'calc(100% - 384px)'}>
									{
										authed && <Header name="Downwrite" onClick={toggleNav} />
									}
									<Switch>
										<Route
											exact
											path="/"
											render={(props: Object) =>
												authed === true ? (
													<Main token={token} user={user} {...props} />
												) : (
													<Home {...props} signIn={signIn} signOut={signOut} />
												)}
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
										<Route path="/signout" render={(props: Object) => <SignOut signOut={signOut} />} />
										<Route component={NoMatch} />
									</Switch>
								</Block>
								{navOpen && <Nav username={name} />}
							</Block>
						</Block>
						)
					}

			</Toggle>
			</Router>
		)
	}
}
