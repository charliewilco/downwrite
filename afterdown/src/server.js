import express from 'express'
import { render } from '@jaredpalmer/after'
import routes from './routes'
import Container from './Container'
const assets = require(process.env.RAZZLE_ASSETS_MANIFEST)

const server = express()

server
  .disable('x-powered-by')
  .use(express.static(process.env.RAZZLE_PUBLIC_DIR))
  .get('/*', async (req, res) => {
    try {
      const html = await render({
        req,
        res,
        routes,
        assets,
        document: Container
      })
      res.send(html)
    } catch (error) {
      console.log(error)
      res.send(error)
    }
  })

export default server
