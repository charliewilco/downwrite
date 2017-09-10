import React from 'react'
import { EditorState, convertToRaw } from 'draft-js'
import { DWEditor } from './components'
import { Redirect } from 'react-router-dom'
import { Wrapper, Input, Button } from './components'
import { css } from 'glamor'
import { createElement } from 'glamor/react'
import uuid from 'uuid/v4'

/* @jsx createElement */

const editorShell = css({
  flex: 1,
  marginTop: '-1px',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: 16,
  minHeight: '100%',
  width: `100%`,
  position: 'absolute',
  left: 0,
  right: 0
})

const editorInner = css({
  backgroundColor: 'white',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'rgba(0, 0, 0, .125)',
  fontWeight: '400'
})

export default class extends React.Component {
  static displayName = 'NewPostEditor'

  static defaultProps = {
    author: 'charlespeters'
  }

  state = {
    editorState: EditorState.createEmpty(),
    title: '',
    id: uuid(),
    dateAdded: new Date(),
    saved: false
  }

  // onKeyDown = (event, data, state) => console.log(event.which)

  addNew = body =>
    fetch('/posts', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body
    }).then(console.log)

  addNewPost = () => {
    let { id, title, editorState, dateAdded } = this.state
    let { author } = this.props
    const ContentState = this.state.editorState.getCurrentContent()
    const content = convertToRaw(ContentState)

    const post = JSON.stringify({
      title,
      id,
      author,
      content,
      dateAdded
    })

    return this.addNew(post)
  }

  render () {
    const { editorState, title, saved, id } = this.state
    return saved ? (
      <Redirect to={`/edit/${id}`} />
    ) : (
      <Wrapper paddingTop={20}>
        <Input
          value={title}
          onChange={e => this.setState({ title: e.target.value })}
        />
        <Wrapper>
          <DWEditor
            editorState={editorState}
            onChange={editorState => this.setState({ editorState })}>
            <Button onClick={this.addNewPost}>Add</Button>
          </DWEditor>
        </Wrapper>
      </Wrapper>
    )
  }
}
