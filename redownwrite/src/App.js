// @flow
import * as React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { Subscribe } from 'unstated'
import Helmet from 'react-helmet'
import { Block } from 'glamor/jsxstyle'
import Loadable from 'react-loadable'
import AuthContainer from './Auth'
import ErrorContainer from './Errors'
import OfflineContainer from './Offline'
import { UIFlash, Header, Loading, Nav, Toggle, Logger, Offline } from './components'
import { PrivateRoute } from './CustomRoutes'

type AppProps = {
  authed: boolean,
  token: string,
  user: string,
  name: string,
  signIn: Function,
  signOut: Function
}

type LoaderOpts = {
  loader: Function
}

const ErrorMessage = () => (
  <Subscribe to={[ErrorContainer]}>
    {err =>
      err.state.content.length > 0 && <UIFlash {...err.state} onClose={err.clearFlash} />
    }
  </Subscribe>
)

const Ldx = (opts: LoaderOpts) => Loadable(Object.assign({ loading: Loading }, opts))

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
  static displayName = 'App'

  render() {
    return (
      <Subscribe to={[AuthContainer, OfflineContainer]}>
        {(auth, offline) => (
          <React.Fragment>
            <Offline onChange={offline.handleChange} />
            <Router>
              <Toggle>
                {(navOpen, toggleNav, closeNav) => (
                  <Block minHeight="100%" fontFamily="var(--primary-font)">
                    <Helmet title="Downwrite" />
                    <ErrorMessage />
                    <Logger value={[auth, offline]} />
                    <Block height="100%" className="u-cf">
                      <Block minHeight="100%">
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
                                <Home {...props} signIn={auth.signIn} signOut={auth.signOut} />
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
                          token={auth.state.token}
                          user={auth.state.user}
                          username={auth.state.name}
                        />
                      )}
                    </Block>
                  </Block>
                )}
              </Toggle>
            </Router>
          </React.Fragment>
        )}
      </Subscribe>
    )
  }
}
