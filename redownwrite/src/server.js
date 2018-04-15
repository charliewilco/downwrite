import './shims'
import React, { Fragment } from 'react'
import express from 'express'
import cookieMiddleware from 'universal-cookie-express'
import { renderToString } from 'react-dom/server'
import { StaticRouter, Switch, matchPath } from 'react-router-dom'
import Loadable from 'react-loadable'
import { getBundles } from 'react-loadable/webpack'
import { ServerStyleSheet } from 'styled-components'
import Downwrite from './App'
import stats from '../build/react-loadable.json'
import { PrivateRoute, PublicRoute, IndexRoute } from './CustomRoutes'
import NoMatch from './NoMatch'

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
// - [ ] Remove Loadable and start without it and iterate to it.
// - [ ] Use universal-cookie and pass that into the context. requestInitialData(context: { bearer token })
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
const assets = require(process.env.RAZZLE_ASSETS_MANIFEST)

const createScriptTag = ({ src }) => `<script defer="defer" src="${src}"></script>`
const createLinkTag = ({ href }) => `<link rel="stylesheet" type="text/css" href="${href}" /> `

const mainBundleRegex = new RegExp(
  `${process.env.NODE_ENV === 'production' ? 'main' : 'bundle'}\.(?:.*\.)?js$`
)

const staticCSSRegex = new RegExp(
  `${process.env.NODE_ENV === 'production' ? 'main' : 'bundle'}\.(?:.*\.)?css$`
)

const HWY = ({ body, styles: { tags, link }, scripts, bundles }) => `<!doctype html>
  <head>
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta charset="utf-8" />
      <meta name='theme-color' content='#4FA5C2' />
      <title>Downwrite</title>
      ${tags}
      ${assets.client.css ? createLinkTag({ href: assets.client.css }) : ''}
      <link rel="preload" as="style" type="text/css" href="https://cloud.typography.com/7107912/7996792/css/fonts.css" />
      <link rel="stylesheet" type="text/css" href="https://cloud.typography.com/7107912/7996792/css/fonts.css" />
    </head>
    <body>
      <div class='Root' id="root">${body}</div>
      ${bundles.map(src => createScriptTag({ src }))}
      ${
        process.env.NODE_ENV === 'production'
          ? `<script src="${assets.client.js}" defer></script>`
          : `<script src="${assets.client.js}" defer crossorigin></script>`
      }
    </body>
  </html>`

const app = express()

const PORT = 4100

app.disable('x-powered-by')
app.use(express.static(process.env.RAZZLE_PUBLIC_DIR))
app.use(cookieMiddleware())

app.get('/*', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')

  const cookie = req.universalCookies.get('DW_TOKEN')
  console.log()
  let modules = []
  let context = { cookie }

  const bundles = getBundles(stats, modules)
    // Create <script defer> tags from bundle objects
    .map(bundle => `/${bundle.file.replace(/\.map$/, '')}`)
    // Make sure only unique bundles are included
    .filter((value, index, self) => self.indexOf(value) === index)

  const mainBundle = bundles.find(bundle => mainBundleRegex.test(bundle))
  const mainStyles = bundles.find(bundle => staticCSSRegex.test(bundle))

  const sheet = new ServerStyleSheet()

  let markup = renderToString(
    sheet.collectStyles(
      <Loadable.Capture report={m => modules.push(m)}>
        <StaticRouter location={req.url} context={context}>
          <Downwrite />
        </StaticRouter>
      </Loadable.Capture>
    )
  )

  const styleTags = sheet.getStyleTags()

  try {
    const renderer = {
      styles: {
        link: mainStyles,
        tags: styleTags
      },
      body: markup,
      scripts: mainBundle,
      bundles
    }

    let html = HWY(renderer)

    res.send(html)

    console.log(modules)
  } catch (error) {
    let errSheet = new ServerStyleSheet()
    let errorContainer = renderToString(
      errSheet.collectStyles(<NoMatch location={{ pathname: req.url }} />)
    )

    let errStyles = errSheet.getStyleTags()
    let errMarkup = HWY({
      body: errorContainer,
      styles: { tags: errStyles, link: mainStyles },
      scripts: mainBundle,
      bundles
    })

    res.send(errMarkup)
  }
})

export default app

// Need some mechanism for handing initial state and resolving data-fetching
// static getInitialProps() to handle and resolve on the client when routes
// are transitioned to.

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

// class RouteContainer extends Component {}
