import './shims'
import React, { Fragment } from 'react'
import express from 'express'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import Loadable from 'react-loadable'
import { getBundles } from 'react-loadable/webpack'
import stats from '../../build/react-loadable.json'
import { ServerStyleSheet } from 'styled-components'
import Downwrite from './App'

// NOTE:
// Working through this with backpack I'm noticing that the modules in `redownwrite` aren't accepting babel transform
// Wonder if taking it into the redownwrite repository would help.
// Spectrum does this by parsing them from the root of their monorepo.

// Okay that worked
// Need to update client-side config to use `new ReactLoadablePlugin({ filename: './dist/react-loadable' })`

const createScriptTag = ({ src }) => `<script defer="defer" src="${src}"></script>`
const mainBundleRegex = new RegExp(
  `${process.env.NODE_ENV === 'production' ? 'main' : 'bundle'}\.(?:.*\.)?js$`
)

const app = express()

const PORT = 4100

app.disable('x-powered-by')

app.get('/*', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')

  let modules = []
  let context = {}

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

  const bundles = getBundles(stats, modules)
    // Create <script defer> tags from bundle objects
    .map(bundle => `/${bundle.file.replace(/\.map$/, '')}`)
    // Make sure only unique bundles are included
    .filter((value, index, self) => self.indexOf(value) === index)

  try {
    let html = `
    <!DOCTYPE html>
      <head>
        <title>Downwrite</title>
        ${styleTags}
      </head>
      <body>
        <div id="root">
          ${markup}
        </div>
        ${bundles.map(src => createScriptTag({ src }))}
        ${createScriptTag({ src: `/static/js/${mainBundle}` })}
      </body>
    </html>
  `

    res.send(html)

    console.log(modules)
  } catch (error) {
    res.json(error)
  }
})

app.listen(PORT, () => console.log(`Highway is running on PORT: ${PORT}`))

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
