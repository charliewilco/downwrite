import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import './index.css'
import registerServiceWorker from './registerServiceWorker'
import 'typeface-roboto-mono'

class Downwrite extends React.Component {
  state = {
    data: {}
  }

  componentWillMount () {
    fetch('https://dwn-api.now.sh/stuff')
      .then(res => res.json())
      .then(data => this.setState({ data }))
      .catch(err => console.error(err))
  }

  render () {
    return <App data={this.state.data} />
  }
}

ReactDOM.render(<Downwrite />, document.getElementById('root'))
registerServiceWorker()
