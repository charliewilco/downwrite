import React from 'react'
import { Editor, Plain, Raw } from 'slate'
import Wrapper from '../Wrapper'
import Input from '../Input'
import Button from '../Button'
import { css } from 'glamor'
import uuid from 'uuid/v4'

const editorShell = css({
  flex: 1,
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

let inputStyle = css({
  marginBottom: 16
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
  static displayName = 'SlateEditor'

  state = {
    title: '',
    content: Raw.deserialize(initialContent, { terse: true })
  }

  onKeyDown = (event, data, state) => console.log(event.which)

  onChange = content => this.setState({ content })

  addNew = () => fetch('/posts', {
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

  onDocumentChange = (document, state) => {
    const content = JSON.stringify(Raw.serialize(state))
    console.log(document, content, state)
  }


  render () {
    const { content, title } = this.state
    return (
      <Wrapper paddingTop={20}>
        <Input
          value={title}
          onChange={e => this.setState({ title: e.target.value })}
        />

        <Wrapper className={css(editorShell, editorInner)}>
          <Button positioned onClick={this.addNew}>Add</Button>
          <Editor state={content} onKeyDown={this.onKeyDown} onChange={this.onChange} />
        </Wrapper>
      </Wrapper>
    )
  }
}
