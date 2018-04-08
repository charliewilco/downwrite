import { Component } from 'react'
import express from 'express'

const server = express()
server.disable('x-powered-by').get('/*', (req, res) => {
  try {
    let html = `Hello`
    res.send(html)
  } catch (error) {
    res.json(error)
  }
})

export default server

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

class RouteContainer extends Component {}
