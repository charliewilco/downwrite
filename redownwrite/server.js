/* eslint-disable no-console */
const express = require('express')
const proxy = require('http-proxy-middleware')
const cookiesMiddleware = require('universal-cookie-express')
const next = require('next')
const { parse } = require('url')
const { join } = require('path')
const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const { isNotLoggedIn } = require('./utils/middleware')
const API_URL = dev ? 'http://localhost:4411' : 'https://api.downwrite.us'

app.prepare().then(() => {
  const server = express()

  server.use(cookiesMiddleware())

  server.get('/', isNotLoggedIn, (req, res) => app.render(req, res, '/', req.params))

  server.get('/new', isNotLoggedIn, (req, res) => app.render(req, res, '/new'))
  server.get('/login', (req, res) => app.render(req, res, '/login'))
  server.get('/:id/edit', isNotLoggedIn, (req, res) =>
    app.render(req, res, '/edit', req.params)
  )
  server.get('/:id/preview', (req, res) =>
    app.render(req, res, '/preview', req.params)
  )

  server.use('/api', proxy({ target: API_URL, changeOrigin: true }))

  server.get('*', (req, res) => {
    const parsedUrl = parse(req.url, true)
    const { pathname } = parsedUrl

    if (pathname === '/service-worker.js') {
      const filePath = join(__dirname, '.next', pathname)
      res.setHeader('Service-Worker-Allowed', '/')
      app.serveStatic(req, res, filePath)
    } else {
      handle(req, res, parsedUrl)
    }
  })

  server.listen(port, err => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})
