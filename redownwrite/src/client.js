import React from 'react'
import { hydrate } from 'react-dom'
import Loadable from 'react-loadable'
import BrowserRouter from 'react-router-dom/BrowserRouter'
import Downwrite from './App'
import './index.css'
import { loadCSS } from 'fg-loadcss'
import registerServiceWorker from './registerServiceWorker'

let PREVIEW_FONTS = 'https://cloud.typography.com/7107912/7471392/css/fonts.css'

let container = document.getElementById('root')
let styleEntry = document.getElementById('loadcss')

window.main = () => {
  Loadable.preloadReady().then(() => {
    hydrate(
      <BrowserRouter>
        <Downwrite />
      </BrowserRouter>,
      container
    )
  })

  loadCSS(PREVIEW_FONTS, styleEntry)
  registerServiceWorker()
}

if (module.hot) {
  module.hot.accept()
}
