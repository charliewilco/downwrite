Login is properly setting the token

The following need to reliably retrieve the token

* index
* edit
* new

using the `universal-cookies-middleware` neatly attaches the token to the header but i can't nest `getInitialProps`

## adding the token to the query helped

## Outstanding Issues Dec 25

on the other machine it's working sort of.

* need to pass down token, user, id as needed
* could a HOC actually help with this?
* what about nested `getInitialProps`?

---

## Outstanding Issues Dec 26

* `Router.push('/', { query: token })` isn't working right now on successful login...
* Linking on the client side is showing error before content loads. this seems relatively easy to fix. - Ref: [Getting strange 404 before page loads](https://github.com/zeit/next.js/issues/2208)

https://github.com/luisrudge/next.js-auth0
https://github.com/estrada9166/server-authentication-next.js
https://github.com/trandainhan/next.js-example-authentication-with-jwt
https://github.com/zeit/next.js/issues/2208

---

### Reverting Back to CRA

TODO:

I should really really curate the smarter changes from the Next.js rebuild. Off the top of my head that's this stuff.

1. ~~collect CSS from next.js branch~~
2. ~~grab fixes for empty title in new post~~
3. the state updating clean up in edit
4. ~~use Bolt instead of Lerna~~


#### Validate the Token Client-Side

In an instance of `componentWillMount` fetch a validation endpoint. If it doesn't respond with an error, set the state of `off` to be true. On the server, with the validation endpoint, use the `pre` method. If the `pre` method fails, it should error out on its own, and the controller can reply with whatever.

The non-optimal choice is to decode the token on the client, and check the expiration time against the current time.

Either implementation needs to handle the case for when a fetch request errors out. The user needs feedback.

Or better option just handle the error


---

### April 2018

Working through this with backpack I'm noticing that the modules in `redownwrite` aren't accepting babel transform. Wonder if taking it into the redownwrite repository would help. Spectrum does this by parsing them from the root of their monorepo.

Okay that worked.

Need to update client-side config to use `new ReactLoadablePlugin({ filename: './dist/react-loadable' })`

Map through routes next comes from express `req, res, next`

```js
const active = routes.find(route => matchPath(req.url, route));
const requestInitialData = active.component.requestInitialData && activeRoute.component.requestInitialData();

Promise.resolve(requestInitialData).then(initialData => {
  const context = { initialData };
  const markup = renderToString(
    <StaticRouter location={req.url} context={context}>
      <App />
    </StaticRouter>
  );
}).catch(next)
```

Needs to go in `renderToString()`

```html
<script>window.__initialData__ = ${serialize(initialData)}</script>
```

- [ ] Use CORS
- [x] Remove Loadable and start without it and iterate to it.
- [x] Use universal-cookie and pass that into the context. `requestInitialData(context: { bearer token })`
- [ ] work through serialized data to pull from the staticContext


```js
constructor(props) {
  super(props)

  let repos
  if (__isBrowser__) {
    repos = window.__INITIAL_DATA__
    delete window.__INITIAL_DATA__
  } else {
    repos = props.staticContext.data
  }
}
```

The other thing that could be done is the extend Component to a "Container" that preloads the `static method()` from the component and then renders the component or a HOC that can do something similar

FWIW, Suspense will fix this

Need some mechanism for handing initial state and resolving data-fetching `static getInitialProps()` to handle and resolve on the client when routes are transitioned to.

`<RouteContainer />` This grabs a route array from a route config.

```js
async function loadInitialProps(routes, pathname, ctx) {
  const promises = []
  const match = routes.find(route => {
    const match = matchPath(pathname, route)
    if (match && route.component && route.component.getInitialProps) {
      promises.push(
        route.component.load
          ? route.component
              .load() // load it as well
              .then(() => route.component.getInitialProps({ match, ...ctx }).catch(() => {}))
          : route.component.getInitialProps({ match, ...ctx }).catch(() => {})
      )
    }
    return match
  })
  return {
    match,
    data: (await Promise.all(promises))[0]
  }
}

class RouteContainer extends Component {}

```

Need to inject default state of auth, which we can check by getting the `cookie`. We can decode it, can pass everything into the constructor of the Container in unstated
