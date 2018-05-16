// @flow
import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { IndexRoute, PrivateRoute } from './CustomRoutes'

import NewEditor from './New'
import PostEditor from './Edit'
import Home from './Home'
import Dashboard from './Dashboard'
import NotFound from './NoMatch'
import SignOut from './SignOut'
import Preview from './Preview'
import Legal from './Legal'

// NOTE:
// Componentizing <IndexRoute /> caused issues in ordering so it was moved to
// least specific route.

export default () => (
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
