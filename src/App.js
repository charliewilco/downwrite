import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'

import Header from './components/Header'
import Editor from './components/Editor/old'
import './App.css'

const EditorView = () =>
  <div className='App'>
    <Header name='Re:Downwrite Web' />
    <h1 className='u-center'>Fuck it</h1>
    <p className='u-center'>To get started, edit <code>src/App.js</code> and save to reload.</p>
  </div>

const MainView = () =>
  <div className='App'>
    <Header name='Re:Downwrite Web' />
    <Editor />
    <p className='u-center'>To get started, edit <code>src/App.js</code> and save to reload.</p>
  </div>

const NoMatch = props =>
  <div>
    <Header name='Re:Downwrite Web 404' />
    <div className='o-Container o-Container--sm o-Container--center'>
      <h2>404</h2>
      <p>Sorry but {props.location.pathname} didn’t match any pages</p>
    </div>
  </div>

const App = () => (
  <BrowserRouter>
    <Switch>
      <Route exact={true} path='/' component={MainView} />
      <Route path='/new' component={EditorView} />
      <Route component={NoMatch} />
    </Switch>
  </BrowserRouter>
)

export default App
