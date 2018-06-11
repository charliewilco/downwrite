const express = require('express')
const cookiesMiddleware = require('universal-cookie-express')
const next = require('next')
const url = require('url')
const { join } = require('path')
const port = parseInt(process.env.PORT, 10) || 4000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()
const root = process.cwd()

const { isLoggedIn, isNotLoggedIn } = require('./utils/middleware')

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

  server.get('/sw.js', (req, res) => {
    let pathname = join(root, `./${req.url}`)

    res.setHeader('Service-Worker-Allowed', '/')
    app.serveStatic(req, res, pathname)
  })

  server.get('*', (req, res) => handle(req, res))

  server.listen(port, err => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})
