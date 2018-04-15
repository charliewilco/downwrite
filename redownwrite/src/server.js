import './shims'
import React, { Fragment } from 'react'
import express from 'express'
import cookieMiddleware from 'universal-cookie-express'
import isEmpty from 'lodash/isEmpty'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import Loadable from 'react-loadable'
import { getBundles } from 'react-loadable/webpack'
import { ServerStyleSheet } from 'styled-components'
import Downwrite from './App'
import stats from '../build/react-loadable.json'
import NoMatch from './NoMatch'
import renderer from './utils/renderer'

// NOTE:
// Working through this with backpack I'm noticing that the modules in `redownwrite` aren't accepting babel transform
// Wonder if taking it into the redownwrite repository would help.
// Spectrum does this by parsing them from the root of their monorepo.
// Okay that worked
// Need to update client-side config to use `new ReactLoadablePlugin({ filename: './dist/react-loadable' })`

// NOTE:
// Map through routes
// const active = routes.find(route => matchPath(req.url, route));
// const requestInitialData = active.component.requestInitialData && activeRoute.component.requestInitialData();
// Promise.resolve(requestInitialData).then(initialData => {
//   const context = { initialData };
//   const markup = renderToString(
//     <StaticRouter location={req.url} context={context}>
//       <App />
//     </StaticRouter>
//   );
// }).catch(next)
//
// Needs to go in renderToString()
// <script>window.__initialData__ = ${serialize(initialData)}</script>
//

// TODO:
// - [ ] Use CORS
// - [x] Remove Loadable and start without it and iterate to it.
// - [z] Use universal-cookie and pass that into the context. requestInitialData(context: { bearer token })
// - [ ] work through serilizaed data to pull from the staticContext
// constructor(props) {
//   super(props)
//
//   let repos
//   if (__isBrowser__) {
//     repos = window.__INITIAL_DATA__
//     delete window.__INITIAL_DATA__
//   } else {
//     repos = props.staticContext.data
//   }
//

// NOTE:
// The other thing that could be done is the extend Component to a "Container" that preloads
// the `static method()` from the component and then renders the component
// or a HOC that can do something similar
// FWIW, Suspense will fix this

// NOTE:
// Need some mechanism for handing initial state and resolving data-fetching
// static getInitialProps() to handle and resolve on the client when routes
// are transitioned to.

// TODO:
// Need to inject default state of auth, which we can check by getting the `cookie`
// We can decode it, can pass everything into the constructor of the Container in unstated

// IDEA:
// <RouteContainer />
// This grabs a route array from a route config.
// async function loadInitialProps(routes, pathname, ctx) {
//   const promises = []
//   const match = routes.find(route => {
//     const match = matchPath(pathname, route)
//     if (match && route.component && route.component.getInitialProps) {
//       promises.push(
//         route.component.load
//           ? route.component
//               .load() // load it as well
//               .then(() => route.component.getInitialProps({ match, ...ctx }).catch(() => {}))
//           : route.component.getInitialProps({ match, ...ctx }).catch(() => {})
//       )
//     }
//     return match
//   })
//   return {
//     match,
//     data: (await Promise.all(promises))[0]
//   }
// }
//
// class RouteContainer extends Component {}

// NOTE:
// Create <script defer> tags from bundle objects
// Make sure only unique bundles are included

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST)

const app = express()

const PORT = 4100

app.disable('x-powered-by')
app.use(express.static(process.env.RAZZLE_PUBLIC_DIR))
app.use(cookieMiddleware())

app.get('/*', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')

  const cookie = req.universalCookies.get('DW_TOKEN')

  let modules = []
  let context = {}
  let serverContext = {
    state: { token: cookie, authed: !isEmpty(cookie) },
    signIn: () => {},
    signOut: () => {}
  }

  const sheet = new ServerStyleSheet()

  let markup = renderToString(
    sheet.collectStyles(
      <Loadable.Capture report={moduleName => modules.push(moduleName)}>
        <StaticRouter location={req.url} context={context}>
          <Downwrite serverContext={serverContext} />
        </StaticRouter>
      </Loadable.Capture>
    )
  )

  const styleTags = sheet.getStyleTags()

  const bundles = getBundles(stats, modules)
  const chunks = bundles.filter(bundle => bundle.file.endsWith('.js'))

  try {
    let html = renderer(styleTags, markup, chunks, serverContext)

    res.send(html)
  } catch (error) {
    let errSheet = new ServerStyleSheet()
    let errorContainer = renderToString(
      errSheet.collectStyles(<NoMatch location={{ pathname: req.url }} />)
    )

    let errStyles = errSheet.getStyleTags()
    let errMarkup = renderer(errStyles, errorContainer, chunks, {})

    res.send(errMarkup)
  }
})

export default app
