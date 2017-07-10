import React from 'react'
import { Editor, Raw } from 'slate'
import { Redirect } from 'react-router-dom'
import Wrapper from './components/Wrapper'
import Input from './components/Input'
import Button from './components/Button'
import { css } from 'glamor'
import uuid from 'uuid/v4'

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

const initialContent = {
  nodes: [
    {
      kind: 'block',
      type: 'paragraph'
    }
  ]
}

export default class extends React.Component {
  static displayName = 'NewPostEditor'

  static defaultProps = {
    author: 'charlespeters'
  }

  state = {
    title: '',
    content: Raw.deserialize(initialContent, { terse: true }),
    document: null,
    id: uuid(),
    dateAdded: new Date(),
    saved: false
  }

  // onKeyDown = (event, data, state) => console.log(event.which)

  addNew = body => fetch('/posts', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }, body
  })
    .then(() => this.setState({ saved: true }))

  addNewPost = () => {
    let { id, title, document, dateAdded } = this.state
    let { author } = this.props
    const content = Raw.serialize(this.state.content)

    const post = JSON.stringify({
      title,
      id,
      author,
      content,
      dateAdded,
      document
    })

    return this.addNew(post)
  }

  logger = (document, state) => {
    const content = JSON.stringify(Raw.serialize(state))
    console.group()
    console.log('from the document change')
      console.log('document', document)
      console.log('content', content)
      console.log('state', state)
    console.groupEnd()
  }

  onChange = (document, state) => this.setState({
    content: state,
    document
  }, this.logger(document, state))

  render () {
    const { content, title, saved, id } = this.state
    return (
      saved
      ? (<Redirect to={`/edit/${id}`} />)
      : (
        <Wrapper paddingTop={20}>
          <Input value={title} onChange={e => this.setState({ title: e.target.value })} />
          <Wrapper className={css(editorShell, editorInner)}>
            <Button positioned onClick={this.addNewPost}>Add</Button>
            <Editor state={content} onDocumentChange={this.onChange} />
          </Wrapper>
        </Wrapper>
      )
    )
  }
}
