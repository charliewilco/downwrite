import React from 'react'

import NewEditor from '../New'
import PostEditor from '../Edit'
import Home from '../Home'
import Dashboard from '../Dashboard'
import Preview from '../Preview'
import Legal from '../Legal'

import { IndexRoute, PublicRoute, PrivateRoute } from '../CustomRoutes'

export const routes = [
  {
    path: '/',
    exact: true,
    component: Dashboard,
    defaultComponent: Home,
    home: true
  },
  {
    path: '/new',
    component: NewEditor,
    private: true
  },
  {
    path: '/:id/edit',
    component: PostEditor,
    private: true
  },
  {
    path: '/:id/preview',
    component: Preview
  },
  {
    path: '/legal',
    component: Legal
  }
]

export const chooseRoute = route =>
  route.private ? PrivateRoute : route.home ? IndexRoute : PublicRoute

export const chooseComponent = (route, authed) =>
  !authed && route.defaultComponent ? route.defaultComponent : route.component

export const findRoute = (routes, authed, initialData) => {
  return routes.map((route, i) => {
    const Route = chooseRoute(route)
    const Cx = chooseComponent(route, authed)

    const SSRCx = () => <Cx {...initialData} />

    return <Route key={i} {...route} component={SSRCx} />
  })
}
