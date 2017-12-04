import React from 'react'
import ReactDOM from 'react-dom'
import Auth from './Auth'
import App from './App'
import './index.css'
import { loadCSS } from 'fg-loadcss'
import registerServiceWorker from './registerServiceWorker'

const PREVIEW_FONTS = 'https://cloud.typography.com/7107912/7471392/css/fonts.css'

const Downwrite = () => (
	<Auth>
		{(authed, token, user, name, signIn, signOut) => (
			<App
				authed={authed}
				token={token}
				user={user}
				name={name}
				signIn={signIn}
				signOut={signOut}
			/>
		)}
	</Auth>
)

ReactDOM.render(<Downwrite />, document.getElementById('root'))
loadCSS(PREVIEW_FONTS, document.getElementById("loadcss"))
registerServiceWorker()
