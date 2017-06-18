import React from 'react'
import { Editor, Plain, Raw } from 'slate'
import Wrapper from '../Wrapper'
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
  fontWeight: '500'
})

const initialState = {
  nodes: [
    {
      kind: 'block',
      type: 'paragraph',
      nodes: [
        {
          kind: 'text',
          text: 'Recently I transitioned from working as a freelancer and agency work to working full time on a product at Onvia. Onvia is the most useful tool for buyers in the business-to-government space; their main application connects government proposals with buyers. In my role, I\'ve been working to define code styles across a medium sized team, curating best practices, defining process and finding that middle path between developer productivity and clarity.'
        }
      ]
    },
    {
      kind: 'block',
      type: 'paragraph',
      nodes: [
        {
          kind: 'text',
          text: 'What I\'d like to explore in 30 minutes is what it\'s like to work on a React application day in and day out.'
        }
      ]
    }
  ]
}

export default class DWEditor extends React.Component {
  state = {
    editorState: Plain.deserialize('')
  }

  onKeyDown = (event, data, state) => console.log(event.which)

  onChange = editorState => this.setState({ editorState })

  postsNewStory = () => fetch('/posts', {
    method: 'POST',
    body: {
      title: 'Fake title',
      id: uuid(),
      content: Plain.serialize(this.state.editorState)
    }
  })

  render () {
    const { editorState } = this.state
    return (
      <Wrapper className={css(editorShell, editorInner)}>
        <Button children='+' onClick={this.postsNewStory} />
        <Editor state={editorState} onKeyDown={this.onKeyDown} onChange={this.onChange} />
      </Wrapper>
    )
  }
}
