import React from 'react'
import { render } from 'react-dom'
import Downwrite from './App'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { loadCSS } from 'fg-loadcss'
import registerServiceWorker from './registerServiceWorker'

let PREVIEW_FONTS = 'https://cloud.typography.com/7107912/7471392/css/fonts.css'

let container = document.getElementById('root')
let styleEntry = document.getElementById('loadcss')

const App = () => (
  <BrowserRouter>
    <Downwrite />
  </BrowserRouter>
)

// if (module.hot) {
//   module.hot.accept('./App', () => {
//     const NextApp = require('./App').default
//     ReactDOM.render(
//       <NextApp renderer={renderer} />,
//       rootEl
//     )
//   })
// }

render(<App />, container)

loadCSS(PREVIEW_FONTS, styleEntry)
registerServiceWorker()
