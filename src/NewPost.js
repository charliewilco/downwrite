import React from 'react'
import { Editor, Raw } from 'slate'
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

  state = {
    title: '',
    content: Raw.deserialize(initialContent, { terse: true }),
    document: null
  }

  // onKeyDown = (event, data, state) => console.log(event.which)

  addNew = body => fetch('/posts', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: this.state.title,
      id: uuid(),
      content: JSON.stringify(Raw.serialize(this.state.content))
    })
  })

  addNewPost = () => {
    let id = uuid()
    let { title, document } = this.state
    const content = Raw.serialize(this.state.content)

    const post = JSON.stringify({
      title,
      id,
      content,
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
    const { content, title } = this.state
    return (
      <Wrapper paddingTop={20}>
        <Input value={title} onChange={e => this.setState({ title: e.target.value })} />
        <Wrapper className={css(editorShell, editorInner)}>
          <Button positioned onClick={this.addNewPost}>Add</Button>
          <Editor state={content} onDocumentChange={this.onChange} />
        </Wrapper>
      </Wrapper>
    )
  }
}
