// @flow
import React, { type ElementType } from 'react'
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
// const DashboardLx = Lx({ loader: () => import('../Dashboard') })
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

// Loadable.Map({
//   loader: {
//     Bar: () => import('./Bar'),
//     i18n: () => fetch('./i18n/bar.json').then(res => res.json()),
//   },
//   render(loaded, props) {
//     let Bar = loaded.Bar.default;
//     let i18n = loaded.i18n;
//     return <Bar {...props} i18n={i18n}/>;
//   },
// });

// [2]
// We can funnel out the Component.getInitialData some other way.
// that might require a few issues to be resolved first.

// [3]
// Ditch react-loadable for the preset and iterate on solution 1.

// [4]
// Consider using react-loadable for components like the Editor, Export and save async routing for Suspense

type RouteObject = {
  path?: string,
  component: ElementType,
  private?: boolean,
  defaultComponent?: ElementType,
  home?: boolean
}

export const routes: Array<RouteObject> = [
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

export const findRoute = (
  routes: Array<RouteObject>,
  authed: boolean,
  initialData: {}
) =>
  routes.map((route, i) => {
    const Route = chooseRoute(route)
    const Cx = chooseComponent(route, authed)
    const SSRCx = props => <Cx {...props} {...initialData} />

    return <Route key={i} {...route} component={SSRCx} />
  })
