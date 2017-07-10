import React from 'react'
import { EditorState } from 'draft-js'
import Editor from './components/Editor'
import Input from './components/Input'
import Wrapper from './components/Wrapper'
import { css } from 'glamor'

const Loading = () => (
  <div>
    <h1>Loading</h1>
  </div>
)

class Edit extends React.Component {
  state = {
    post: {},
    editorState: EditorState.createEmpty()
  }

  componentWillMount () {
    fetch(`/posts/${this.props.match.params.id}`)
      .then(res => res.json())
      .then(data => this.setState({ post: data }))
  }

  updateTitle = e => this.setState({
    post: {
      ...this.state.post,
      title: e.target.value
    }
  })

  render () {
    const { editorState, post } = this.state
    console.log(this.state.post, this.context)
    return (
      !post ? <Loading /> : (
        <Wrapper paddingTop={16}>
          <Input
            value={post.title}
            onChange={this.updateTitle}
          />
          <Editor
            editorState={editorState}
            onChange={e => this.setState({ post: { ...post, body: e } })}
          />
        </Wrapper>
      )
    )
  }
}

/*
  <Editor editorState={this.props.post.body} />
*/


export default Edit
