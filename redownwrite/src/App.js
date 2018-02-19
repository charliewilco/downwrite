// @flow
import * as React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { Subscribe } from 'unstated'
import Helmet from 'react-helmet'
import Media from 'react-media'
import { Block } from 'glamor/jsxstyle'
import Loadable from 'react-loadable'
import AuthContainer from './Auth'
import { Header, Loading, Nav, Toggle, Logger } from './components'
import { PrivateRoute } from './CustomRoutes'

type AppProps = {
  authed: boolean,
  token: string,
  user: string,
  name: string,
  signIn: Function,
  signOut: Function
}

const Ldx = opts => Loadable(Object.assign({ loading: Loading }, opts))

const New = Ldx({
  loader: () => import('./New')
})

const Edit = Ldx({
  loader: () => import('./Edit')
})

const Home = Ldx({
  loader: () => import('./Home')
})

const Dashboard = Ldx({
  loader: () => import('./Dashboard')
})

const NotFound = Ldx({
  loader: () => import('./NoMatch')
})

const SignOut = Ldx({
  loader: () => import('./SignOut')
})

const Preview = Ldx({
  loader: () => import('./Preview')
})

const Legal = Ldx({
  loader: () => import('./Legal')
})

export default class extends React.Component<AppProps, void> {
  static displayName = 'AppRouterContainer'

  render() {
    return (
      <Subscribe to={[AuthContainer]}>
        {auth => (
          <Router>
            <Media query={{ minWidth: 500 }}>
              {matches => (
                <Toggle>
                  {(navOpen, toggleNav, closeNav) => (
                    <Block minHeight="100%" fontFamily="var(--primary-font)">
                      <Helmet title="Downwrite" />
                      <Logger value={auth} />
                      <Block height="100%" className="u-cf">
                        <Block
                          minHeight="100%"
                          float={navOpen && matches && 'left'}
                          width={navOpen && matches && 'calc(100% - 384px)'}>
                          <Header
                            name="Downwrite"
                            authed={auth.state.authed}
                            open={navOpen}
                            onClick={toggleNav}
                          />

                          <Switch>
                            <Route
                              exact
                              path="/"
                              render={(props: Object) =>
                                auth.state.authed === true ? (
                                  <Dashboard
                                    closeNav={closeNav}
                                    token={auth.state.token}
                                    user={auth.state.user}
                                    {...props}
                                  />
                                ) : (
                                  <Home
                                    {...props}
                                    signIn={auth.signIn}
                                    signOut={auth.signOut}
                                  />
                                )
                              }
                            />

                            <PrivateRoute path="/new" component={New} />
                            <PrivateRoute path="/:id/edit" component={Edit} />
                            <Route exact path="/:id/preview" component={Preview} />
                            <Route
                              exact
                              path="/signout"
                              render={(props: Object) => (
                                <SignOut toggleNav={closeNav} signOut={auth.signOut} />
                              )}
                            />
                            <Route path="/legal" component={Legal} />

                            <Route component={NotFound} />
                          </Switch>
                        </Block>
                        {navOpen && (
                          <Nav
                            closeNav={closeNav}
                            matches={matches}
                            token={auth.state.token}
                            user={auth.state.user}
                            username={auth.state.name}
                          />
                        )}
                      </Block>
                    </Block>
                  )}
                </Toggle>
              )}
            </Media>
          </Router>
        )}
      </Subscribe>
    )
  }
}
