React Loadable has an issue, when we wrap the component in the function we no longer  have access to the Component.getInitialData() method that we attempt to resolve on the server before we send the initial tree back. There should be a way around this.

## [1]

In the config we could specify the path to the component we could do this:

```js
Loadable({
  loader: () => import('./Bar'),
  modules: ['./Bar'],
  webpack: () => [require.resolveWeak('./Bar')],
});

Loadable.Map({
  loader: {
    Bar: () => import('./Bar'),
    i18n: () => fetch('./i18n/bar.json').then(res => res.json()),
  },
  render(loaded, props) {
    let Bar = loaded.Bar.default;
    let i18n = loaded.i18n;
    return <Bar {...props} i18n={i18n}/>;
  },
});
```

that might fix the issue.

## [2]

We can funnel out the Component.getInitialData some other way. that might require a few issues to be resolved first.

## [3]

Ditch react-loadable for the preset and iterate on solution 1.

## [4]

Consider using react-loadable for components like the Editor, Export and save async routing for Suspense


---

NOTE:

Initially it might've been easier to map through only the active route.

```js
routes.filter(route => activeRoute.path === route.path)
```

```js
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
```
