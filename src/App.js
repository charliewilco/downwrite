import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { Block } from 'glamor/jsxstyle'
import NewPost from './NewPost'
import EditPost from './EditPost'
import { Header, APIStatus } from './components'
import Main from './Main'
import NoMatch from './NoMatch'

export default ({ data, activeBanner, onAPIDismiss }) => (
  <Router>
    <Block fontFamily='Operator Mono' height='calc(100% - 82px)'>
      <Header name='Re:Downwrite Web' />
      {process.env.NODE_ENV === 'development' &&
        (activeBanner && (
          <APIStatus
            data={data}
            env={process.env.NODE_ENV}
            onDismiss={onAPIDismiss}
          />
        ))}
      <Switch>
        <Route exact path='/' component={Main} />
        <Route path='/new' component={NewPost} />
        <Route path='/edit/:id' component={EditPost} />
        <Route component={NoMatch} />
      </Switch>
    </Block>
  </Router>
)
