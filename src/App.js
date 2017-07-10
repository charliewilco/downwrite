// import 'typeface-roboto-mono'
import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { Block } from 'glamor/jsxstyle'
import NewPost from './NewPost'
import EditPost from './EditPost'
import Header from './components/Header'
import Main from './Main'
import NoMatch from './NoMatch'

// function handleResponse(response) {
//   if (response.ok) {
//     return response.json()
//   } else {
//     let error = new Error(response.statusText)
//     error.response = response
//     throw error
//   }
// }


// fetch('/profile')

export default () => (
  <Router>
    <Block fontFamily='Operator Mono' height='calc(100% - 82px)'>
      <Header name='Re:Downwrite Web' />
      <Switch>
        <Route exact path='/' component={Main} />
        <Route path='/new' component={NewPost} />
        <Route path='/edit/:id' component={EditPost} />
        <Route component={NoMatch} />
      </Switch>
    </Block>
  </Router>
)
