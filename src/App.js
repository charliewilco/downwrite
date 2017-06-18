// import 'typeface-roboto-mono'
import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import { Block } from 'glamor-jsxstyle'
import Editor from './components/Editor/slate'
import Edit from './EditEditor'
import Header from './components/Header'
import Main from './Main'
import NoMatch from './NoMatch'
// import EditorView from './components/EditorView'

// function handleResponse(response) {
//   if (response.ok) {
//     return response.json()
//   } else {
//     let error = new Error(response.statusText)
//     error.response = response
//     throw error
//   }
// }

class App extends React.Component {
  state = {
    posts: [],
    loaded: false
  }


  componentWillMount () {
    fetch('/posts')
      .then(res => res.json())
      .then(data => this.setState({ posts: data, loaded: true }))
  }

  render () {
    // const NEditor = () => (
    //   <EditorView
    //     title={fakeNewTitle}
    //     onTitleChange={e => this.setState({ fakeNewTitle: e })}
    //     addNew={this.addNew}
    //     editorState={editorState}
    //     onChange={editorState => this.setState({ editorState })}
    //   />
    // )
    return (
      <Router>
        <Block fontFamily='Operator Mono' height='calc(100% - 82px)'>
          <Header name='Re:Downwrite Web' />
          <Switch>
            <Route exact path='/' render={() => <Main {...this.state} />} />
            <Route exact path='/editor' component={Editor} />
            <Route path='/new' component={Editor} />
            <Route path='/edit/:id' component={Edit} />
            <Route component={NoMatch} />
          </Switch>
        </Block>
      </Router>
    )
  }
}

export default App
