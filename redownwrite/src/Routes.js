import React from 'react'
import { Route, Switch } from 'react-router-dom'
import Loadable from 'react-loadable'
import { IndexRoute, PrivateRoute } from './CustomRoutes'
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

// NOTE:
// Componentizing <IndexRoute /> caused issues in ordering so it was moved to
// least specific route.

export default ({ auth }) => (
  <Switch>
    <PrivateRoute path="/new" component={NewEditor} />
    <PrivateRoute path="/:id/edit" component={PostEditor} />
    <Route exact path="/:id/preview" component={Preview} />
    <Route exact path="/signout" component={SignOut} />
    <Route path="/legal" component={Legal} />
    <IndexRoute component={Dashboard} defaultComponent={Home} />
    <Route component={NotFound} />
  </Switch>
)
