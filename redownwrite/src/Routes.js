import React from 'react'
import { Route, Switch } from 'react-router-dom'
import Loadable from 'react-loadable'
import { PrivateRoute } from './CustomRoutes'
import * as DW from './components'

const Ldx = (opts: { loader: Function }) =>
  Loadable(Object.assign({}, { loading: DW.Loading }, opts))

const NewEditor = Ldx({ loader: () => import('./New') })
const PostEditor = Ldx({ loader: () => import('./Edit') })
const Home = Ldx({ loader: () => import('./Home') })
const Dashboard = Ldx({ loader: () => import('./Dashboard') })
const NotFound = Ldx({ loader: () => import('./NoMatch') })
const SignOut = Ldx({ loader: () => import('./SignOut') })
const Preview = Ldx({ loader: () => import('./Preview') })
const Legal = Ldx({ loader: () => import('./Legal') })

export default ({ auth, closeNav }) => (
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
    <PrivateRoute path="/new" component={NewEditor} />
    <PrivateRoute path="/:id/edit" component={PostEditor} />
    <Route exact path="/:id/preview" component={Preview} />
    <Route
      exact
      path="/signout"
      render={() => <SignOut toggleNav={closeNav} signOut={auth.signOut} />}
    />
    <Route path="/legal" component={Legal} />
    <Route component={NotFound} />
  </Switch>
)
