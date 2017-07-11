import React from 'react'
import { css } from 'glamor'
import { Block } from 'glamor/jsxstyle'
import { Editor, Raw } from 'slate'
import Button from './components/Button'
import Input from './components/Input'
import Loading from './components/Loading'
import Wrapper from './components/Wrapper'
import format from 'date-fns/format'

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

const meta = css({
  opacity: .5,
  fontSize: 'small'
})

const editorInner = css({
  backgroundColor: 'white',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'rgba(0, 0, 0, .125)',
  fontWeight: '400'
})

export default class extends React.Component {
  static displayName = 'UpdatePostEditor'

  state = {
    post: {},
    loaded: false,
    dateModified: null
  }

  prepareContent = content => Raw.deserialize(content, { terse: true })

  componentWillMount () {
    fetch(`/posts/${this.props.match.params.id}`)
      .then(res => res.json())
      .then(post => this.setState({ post }))
      .then(() => this.setState({
        post: {
          ...this.state.post,
          content: this.prepareContent(this.state.post.content)
        },
        loaded: true
      }))
  }

  // onChange = () => console.log('...okay')

  updateTitle = e => this.setState({
    post: {
      ...this.state.post,
      title: e.target.value
    }
  })

  updatePost = body => fetch(`/posts/${this.props.match.params.id}`, {
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    }, body
  })

  onDocumentChange = (document, state) => this.setState({
    post: {
      ...this.state.post,
      content: state,
      document
    },
    dateModified: new Date()
  })


  render () {
    const { post, loaded } = this.state

    return (
      !loaded
      ? <Loading />
      : (
        <Wrapper paddingTop={16}>
          <Block className={css(meta)} marginBottom={8}>
            {post.id} | {post.author} | Date Added: {format(post.dateAdded, 'HH:MM A, DD MMMM YYYY')}
          </Block>
          <Input value={post.title} onChange={this.updateTitle} />
          <Wrapper className={css(editorShell, editorInner)}>
            <Button positioned onClick={this.updatePost}>Up</Button>
            <Editor
              state={post.content}
              onKeyDown={this.onKeyDown}
              onDocumentChange={this.onDocumentChange}
            />
          </Wrapper>
        </Wrapper>
      )
    )
  }
}
