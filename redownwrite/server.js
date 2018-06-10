const express = require('express')
const cookiesMiddleware = require('universal-cookie-express')
const next = require('next')
const url = require('url')

const port = parseInt(process.env.PORT, 10) || 4000
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const { isLoggedIn } = require('./utils/middleware')

app.prepare().then(() => {
  const server = express()

  server.use(cookiesMiddleware())

  server.get('/', isLoggedIn, (req, res) => app.render(req, res, '/', req.params))

  server.get('/new', isLoggedIn, (req, res) => app.render(req, res, '/new'))
  server.get('/login', (req, res) => app.render(req, res, '/login'))
  server.get('/:id/edit', isLoggedIn, (req, res) =>
    app.render(req, res, '/edit', req.params)
  )
  server.get('/:id/preview', (req, res) =>
    app.render(req, res, '/preview', req.params)
  )
  server.get('*', (req, res) => handle(req, res))

  server.listen(port, err => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})
