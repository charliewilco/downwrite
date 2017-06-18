import 'typeface-roboto-mono'
import React from 'react'
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom'
import { EditorState } from 'draft-js'
import Editor from './components/Editor/slate'
import Edit from './EditEditor'
import EditorView from './components/EditorView'
import Header from './components/Header'
import Main from './Main'
import NoMatch from './404'

function handleResponse(response) {
  if (response.ok) {
    return response.json()
  } else {
    let error = new Error(response.statusText)
    error.response = response
    throw error
  }
}


class App extends React.Component {
  state = {
    editorState: EditorState.createEmpty(),
    postAdded: false,
    fakeNewTitle: '',
    posts: []
  }


  componentWillMount () {
    fetch('/posts')
      .then(res => res.json())
      .then(data => this.setState({ posts: data }))
  }


  addNew = () => {
    fetch('/posts', {
      method: 'post',
      body: JSON.stringify({
        title: this.state.fakeNewTitle,
        id: this.state.posts.length + 1,
        body: this.state.editorState,
        author: 'charlespeters'
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(handleResponse)
    .then(data => this.setState({ postAdded: true }))
  }

  render () {
    const { editorState, fakeNewTitle, posts, postAdded } = this.state
    const NEditor = () => (
      <EditorView
        title={fakeNewTitle}
        onTitleChange={e => this.setState({ fakeNewTitle: e })}
        addNew={this.addNew}
        editorState={editorState}
        onChange={editorState => this.setState({ editorState })}
      />
    )
    return (
      <Router>
        <div>
          <Header name='Re:Downwrite Web' />
          <hr />
          <Switch>
            <Route exact path='/' render={() => <Main posts={posts} />} />
            <Route exact path='/editor' component={Editor} />
            <Route path='/new' render={() => postAdded ? <Redirect /> : <NEditor />} />
            <Route path='/edit/:id' component={Edit} />
            <Route component={NoMatch} />
          </Switch>
        </div>
      </Router>
    )
  }
}

export default App
