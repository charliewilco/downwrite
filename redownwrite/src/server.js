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

const assets = require(process.env.RAZZLE_ASSETS_MANIFEST)
const app = express()

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
