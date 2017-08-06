// @flow
import React from 'react'
import { css } from 'glamor'
import { Block } from 'glamor/jsxstyle'
import { Editor, Raw } from 'slate'
import { Button, Input, Loading, Wrapper } from './components'
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

  titleInput: HTMLInputElement

  state = {
    post: {},
    loaded: false,
    dateModified: new Date()
  }

  prepareContent = (content: {}) => Raw.deserialize(content, { terse: true })

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

  onKeyDown = (e: Event) => console.log(e)

  updateTitle = ({ target }: { target: EventTarget }) => this.setState(() => {
    let title = (target instanceof HTMLInputElement) && this.titleInput.value

    return {
      post: {
        ...this.state.post,
        title
      }
    }
  })

  updatePost = (body: Object) => fetch(`/posts/${this.props.match.params.id}`, {
    method: 'put',
    headers: {
      'Content-Type': 'application/json'
    }, body
  })

  onDocumentChange = (document: Object, state: Object) => this.setState({
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
          <Input ref={inp => { this.titleInput = inp }} value={post.title} onChange={this.updateTitle} />
          <Wrapper className={css(editorShell, editorInner)}>
            <Button positioned onClick={this.updatePost}>Up</Button>
            <Editor
              placeholder='Enter some rich text...'
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
