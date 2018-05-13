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

// TODO: sw-precache-plugin
// TODO: Migrate all older CSS files to resets with styled-components
// TODO: Default props `delete window.__initialData__`
// TODO: Look into React Loadable failures
// -- Maybe the imported component needs to be Loadble in the `findRoute()`
// -- Maybe remove Loadable and iterate to it, there's a lot less code now Perf wise
// TODO: Investigate vanishing div on rehydrate
// TODO: Remove useless non-js imports
// -- Reset.css
// -- Moving custom properties to variables
