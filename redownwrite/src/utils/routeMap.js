// @flow
import React, { type Element } from 'react'
// import Loadable from 'react-loadable'
// import { Loading } from '../components'
import { IndexRoute, PublicRoute, PrivateRoute } from '../CustomRoutes'

import NewEditor from '../New'
import PostEditor from '../Edit'
import Home from '../Home'
import Dashboard from '../Dashboard'
import Preview from '../Preview'
import Legal from '../Legal'
import NotFound from '../NoMatch'
import SignOut from '../SignOut'

// const Lx = (opts: { loader: Function }) =>
//   Loadable(Object.assign({}, { loading: Loading }, opts))

// const NewEditor = Lx({ loader: () => import('../New') })
// const PostEditor = Lx({ loader: () => import('../Edit') })
// const Home = Lx({ loader: () => import('../Home') })
// const Dashboard = Lx({ loader: () => import('../Dashboard') })
// const Preview = Lx({ loader: () => import('../Preview') })
// const Legal = Lx({ loader: () => import('../Legal') })
// const NotFound = Lx({ loader: () => import('../NoMatch') })
// const SignOut = Lx({ loader: () => import('../SignOut') })

// TODO:
// React Loadable has an issue, when we wrap the component in the function we no longer
// have access to the Component.getInitialData() method that we attempt to resolve on
// the server before we send the initial tree back. There should be a way around this.

// [1]
// In the config we could specify the path to the component
// we could do this:
// Loadable({
//   loader: () => import('./Bar'),
//   modules: ['./Bar'],
//   webpack: () => [require.resolveWeak('./Bar')],
// });
// that might fix the issue.

// [2]
// We can funnel out the Component.getInitialData some other way.
// that might require a few issues to be resolved first.

// [3]
// Ditch react-loadable for the preset and iterate on solution 1.

type RouteObject = {
  path?: string,
  component: Element,
  private?: boolean,
  defaultComponent?: Element,
  home?: boolean
}

export const routes = [
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
  },
  {
    path: '/signout',
    component: SignOut,
    exact: true
  },
  // {
  //   component: NotFound
  // },
  {
    path: '/',
    exact: true,
    component: Dashboard,
    defaultComponent: Home,
    home: true
  }
]

export const chooseRoute = (route: RouteObject) =>
  route.private ? PrivateRoute : route.home ? IndexRoute : PublicRoute

export const chooseComponent = (route: RouteObject, authed: boolean) =>
  !authed && route.defaultComponent ? route.defaultComponent : route.component

// export const getComponentPath = (route, authed) =>
//   !authed ? route.componentPath : route.defaultComponentPath

// NOTE:
// Initially it might've been easier to map through only the active route.
// .filter(route => activeRoute.path === route.path)

export const findRoute = (routes: Array<RouteObject>, authed: boolean, initialData: {}) =>
  routes.map((route, i) => {
    const Route = chooseRoute(route)
    const Cx = chooseComponent(route, authed)
    const SSRCx = props => <Cx {...props} {...initialData} />

    return <Route key={i} {...route} component={SSRCx} />
  })
