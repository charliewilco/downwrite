import React from 'react'
import ReactDOM from 'react-dom'
import Downwrite from './App'
import './index.css'
import registerServiceWorker from './registerServiceWorker'
import 'typeface-roboto-mono'

ReactDOM.render(<Downwrite />, document.getElementById('root'))
registerServiceWorker()
