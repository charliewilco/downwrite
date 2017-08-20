import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import './index.css'
import registerServiceWorker from './registerServiceWorker'

class Downwrite extends React.Component {
  state = {
    data: {},
    activeBanner: true
  }

  componentWillMount () {
    fetch('https://dwn-api.now.sh/stuff')
      .then(res => res.json())
      .then(data => this.setState({ data }))
      .catch(err => console.error(err))
  }

  render () {
    return (
      <App
        {...this.state}
        onAPIDismiss={() => this.setState({ activeBanner: false })}
      />
    )
  }
}

ReactDOM.render(<Downwrite />, document.getElementById('root'))
registerServiceWorker()
