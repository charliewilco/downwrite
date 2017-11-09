import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import { TOKEN, USER_ID, signOut } from './utils/cookie'
import './index.css'
import registerServiceWorker from './registerServiceWorker'

const Downwrite = () => (<App token={TOKEN} user={USER_ID} signOut={signOut} />)

ReactDOM.render(<Downwrite />, document.getElementById('root'))
registerServiceWorker()
