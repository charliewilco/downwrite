import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { CookiesProvider } from 'react-cookie'
import './index.css'
import registerServiceWorker from './registerServiceWorker'

const Downwrite = () => (
	<CookiesProvider>
		<App />
	</CookiesProvider>
)

ReactDOM.render(<Downwrite />, document.getElementById('root'))
registerServiceWorker()
