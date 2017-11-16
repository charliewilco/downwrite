import React from 'react'
import ReactDOM from 'react-dom'
import Auth from './Auth'
import App from './App'
import './index.css'
import registerServiceWorker from './registerServiceWorker'

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
registerServiceWorker()
