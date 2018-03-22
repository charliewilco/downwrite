// @flow
import * as React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { Subscribe } from 'unstated'
import Helmet from 'react-helmet'
import Loadable from 'react-loadable'
import { AuthContainer, OfflineContainer, ErrorContainer } from './containers'
import * as DW from './components'
import { PrivateRoute } from './CustomRoutes'

const Ldx = (opts: { loader: Function }) =>
  Loadable(Object.assign({}, { loading: DW.Loading }, opts))

const New = Ldx({ loader: () => import('./New') })
const Edit = Ldx({ loader: () => import('./Edit') })
const Home = Ldx({ loader: () => import('./Home') })
const Dashboard = Ldx({ loader: () => import('./Dashboard') })
const NotFound = Ldx({ loader: () => import('./NoMatch') })
const SignOut = Ldx({ loader: () => import('./SignOut') })
const Preview = Ldx({ loader: () => import('./Preview') })
const Legal = Ldx({ loader: () => import('./Legal') })

const UIErrorMessage = () => (
  <Subscribe to={[ErrorContainer]}>
    {err =>
      err.state.content.length > 0 && <DW.UIFlash {...err.state} onClose={err.clearFlash} />
    }
  </Subscribe>
)

export default () => (
  <Subscribe to={[AuthContainer, OfflineContainer]}>
    {(auth, offline) => (
      <React.Fragment>
        <DW.Offline onChange={offline.handleChange} />
        <DW.Logger value={[auth, offline]} />
        <Helmet title="Downwrite" />
        <Router>
          <DW.Shell auth={auth} renderErrors={() => <UIErrorMessage />}>
            {closeNav => (
              <Switch>
                <Route
                  exact
                  path="/"
                  render={(props: Object) =>
                    auth.state.authed === true ? (
                      <Dashboard
                        token={auth.state.token}
                        user={auth.state.user}
                        closeNav={closeNav}
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
            )}
          </DW.Shell>
        </Router>
      </React.Fragment>
    )}
  </Subscribe>
)
