// @flow
import * as React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { Provider, Subscribe } from 'unstated'
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

const UIErrorMessage = ({ content, type, onClose }) =>
  content.length > 0 ? (
    <DW.UIFlash content={content} type={type} onClose={onClose} />
  ) : (
    <DW.Null />
  )

const Downwrite = () => (
  <Provider>
    <Subscribe to={[AuthContainer, OfflineContainer, ErrorContainer]}>
      {(auth, offline, err) => (
        <React.Fragment>
          <DW.Offline onChange={offline.handleChange} />
          <DW.Logger value={[auth, offline]} />
          <Helmet title="Downwrite" />
          <Router>
            <DW.Shell
              auth={auth}
              renderErrors={() => <UIErrorMessage {...err.state} onClose={err.clearFlash} />}>
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
                    render={() => <SignOut toggleNav={closeNav} signOut={auth.signOut} />}
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
  </Provider>
)

export default Downwrite
