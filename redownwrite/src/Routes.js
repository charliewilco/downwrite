import React from 'react'
import { Route, Switch } from 'react-router-dom'
import Loadable from 'react-loadable'
import { PrivateRoute } from './CustomRoutes'
import * as DW from './components'

const Lx = (opts: { loader: Function }) =>
  Loadable(Object.assign({}, { loading: DW.Loading }, opts))

const NewEditor = Lx({ loader: () => import('./New') })
const PostEditor = Lx({ loader: () => import('./Edit') })
const Home = Lx({ loader: () => import('./Home') })
const Dashboard = Lx({ loader: () => import('./Dashboard') })
const NotFound = Lx({ loader: () => import('./NoMatch') })
const SignOut = Lx({ loader: () => import('./SignOut') })
const Preview = Lx({ loader: () => import('./Preview') })
const Legal = Lx({ loader: () => import('./Legal') })

export default ({ auth }) => (
  <Switch>
    <Route
      exact
      path="/"
      render={(props: Object) =>
        auth.state.authed === true ? (
          <Dashboard token={auth.state.token} user={auth.state.user} {...props} />
        ) : (
          <Home {...props} signIn={auth.signIn} signOut={auth.signOut} />
        )
      }
    />
    <PrivateRoute path="/new" component={NewEditor} />
    <PrivateRoute path="/:id/edit" component={PostEditor} />
    <Route exact path="/:id/preview" component={Preview} />
    <Route exact path="/signout" render={() => <SignOut signOut={auth.signOut} />} />
    <Route path="/legal" component={Legal} />
    <Route component={NotFound} />
  </Switch>
)
