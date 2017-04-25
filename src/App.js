import 'typeface-roboto-mono'
import React from 'react'
import { ConnectedRouter, routerReducer, routerMiddleware, push } from 'react-router-redux'
import { createStore, applyMiddleware } from 'redux'
import createHistory from 'history/createBrowserHistory'
import thunk from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'
import { connect, Provider } from 'react-redux'
import { Route, Switch } from 'react-router-dom'
import { EditorState } from 'draft-js'
import EditorView from './components/EditorView'
import Header from './components/Header'
import Main from './Main'
import NoMatch from './404'
import rootReducer from './rootReducer'

const store = createStore(
  rootReducer,
  composeWithDevTools(
    applyMiddleware(thunk, routerMiddleware(history))
  )
)

const history = createHistory()

class App extends React.Component {
  state = {
    editorState: EditorState.createEmpty()
  }

  render () {
    const { editorState } = this.state
    const NEditor = () => (
      <EditorView
        editorState={editorState}
        onChange={editorState => this.setState({ editorState })}
      />
    )
    return (
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <div>
            <Header name='Re:Downwrite Web' />
            <hr />
            <Switch>
              <Route exact path='/' component={Main} />
              <Route path='/new' render={NEditor} />
              <Route component={NoMatch} />
            </Switch>
          </div>
        </ConnectedRouter>
      </Provider>
    )
  }
}

function mapStateToProps (state) {
  console.log(state)
  return state
}

export default App
