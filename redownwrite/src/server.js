import './shims'
import React from 'react'
import express from 'express'
import cookieMiddleware from 'universal-cookie-express'
import isEmpty from 'lodash/isEmpty'
import { renderToString } from 'react-dom/server'
import { StaticRouter, matchPath } from 'react-router-dom'
import Loadable from 'react-loadable'
import { getBundles } from 'react-loadable/webpack'
import { ServerStyleSheet } from 'styled-components'
import 'universal-fetch'

import Downwrite from './App'
import stats from '../build/react-loadable.json'
import NoMatch from './NoMatch'
import renderer from './utils/renderer'
import { routes, findRoute } from './routeMap'

const app = express()

app.disable('x-powered-by')
app.use(express.static(process.env.RAZZLE_PUBLIC_DIR))
app.use(cookieMiddleware())

app.get('/*', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')

  const activeRx = routes.find(route => matchPath(req.url, route))

  const token = req.universalCookies.get('DW_TOKEN')
  const authed = !isEmpty(token)
  let modules = []
  let context = {}

  const defaultInitialDataParams = {
    url: req.url,
    query: matchPath(req.url, activeRx.path)
  }

  console.log(defaultInitialDataParams)

  const requestInitialData =
    activeRx.component.getInitialData &&
    activeRx.component.getInitialData(defaultInitialDataParams, token)

  try {
    Promise.resolve(requestInitialData)
      .then(initialData => {
        const sheet = new ServerStyleSheet()

        let markup = renderToString(
          sheet.collectStyles(
            <Loadable.Capture report={moduleName => modules.push(moduleName)}>
              <StaticRouter location={req.url} context={context}>
                <Downwrite serverContext={{ token, authed }}>
                  {findRoute(routes, authed, initialData)}
                </Downwrite>
              </StaticRouter>
            </Loadable.Capture>
          )
        )

        const styleTags = sheet.getStyleTags()

        const bundles = getBundles(stats, modules)
        const chunks = bundles.filter(bundle => bundle.file.endsWith('.js'))
        let html = renderer(styleTags, markup, chunks, serverContext)
        return res.send(html)
      })
      .catch(err => console.error(err))
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
