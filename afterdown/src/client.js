import React from 'react'
import { hydrate } from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import { ensureReady, After } from '@jaredpalmer/after'
import './client.css'
import routes from './routes'

ensureReady(routes).then(data => {
  console.log(data)
  hydrate(
    <Router>
      <After data={data} routes={routes} />
    </Router>,
    document.getElementById('root')
  )
})

if (module.hot) {
  module.hot.accept()
}
