// @flow
import * as React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import Helmet from 'react-helmet'
import Media from 'react-media'
import { Block } from 'glamor/jsxstyle'
import Loadable from 'react-loadable'
import { Header, Loading, Nav, Toggle } from './components'
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

const Main = Ldx({
  loader: () => import('./Main')
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
                  <Helmet title="Downwrite" />
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
                            <SignOut toggleNav={closeNav} signOut={signOut} />
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
