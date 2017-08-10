// @flow
import React from 'react'
import { css } from 'glamor'
import { Block, Flex } from 'glamor/jsxstyle'
import { Editor, Raw } from 'slate'
import { Button, Input, Loading, Wrapper } from './components'
import format from 'date-fns/format'

// {
//   "title": "New Post I'm Making",
//   "author": "charlespeters",
//   "id": "9fcf1577-b37c-4571-a727-b62eb85e5fe9",
//   "content": {},
//   "dateAdded": "2017-07-10T05:55:04.388Z",
//   "document": {}
// }

const editorShell = css({
  flex: 1,
  marginTop: '-1px',
  flexDirection: 'column',
  justifyContent: 'center',
  minHeight: '100%',
  width: `100%`,
  position: 'absolute',
  left: 0,
  right: 0
})

const editorContent = css({
  position: 'relative',
  paddingTop: 64,
  paddingRight: 16,
  paddingLeft: 16
})

const toolbar = css({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  padding: 8,
  background: 'white',
  borderBottomWidth: 1,
  borderBottomStyle: 'solid',
  borderBottomColor: 'rgba(0, 0, 0, .125)'
})

const meta = css({
  opacity: 0.5,
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
    unchanged: false,
    dateModified: new Date()
  }

  prepareContent = (content: Object) =>
    Raw.deserialize(content, { terse: true })

  componentWillMount () {
    fetch(`/posts/${this.props.match.params.id}`)
      .then(res => res.json())
      .then(post => this.setState({ post }))
      .then(() =>
        this.setState({
          post: {
            ...this.state.post,
            content: this.prepareContent(this.state.post.content)
          },
          loaded: true
        })
      )
  }

  onChange = (content: Object) =>
    this.setState((prev, next) => {
      console.log('from onChange', content, prev, next)
      return {
        post: {
          ...prev.post,
          content,
          unchanged: true
        }
      }
    })

  // onKeyDown = (e: Event) => console.log(e)

  updateTitle = ({ target }: { target: EventTarget }) =>
    this.setState(prevState => {
      let title = target instanceof HTMLInputElement && this.titleInput.value

      return {
        post: {
          ...prevState.post,
          title
        }
      }
    })

  updatePost = (body: Object) =>
    fetch(`/posts/${this.props.match.params.id}`, {
      method: 'put',
      headers: {
        'Content-Type': 'application/json'
      },
      body
    })

  onDocumentChange = (document: Object, state: Object) =>
    this.setState((prevState, nextProps) => {
      console.log('from document change', document, state)
      return {
        post: {
          ...this.state.post,
          content: state,
          document
        },
        dateModified: new Date()
      }
    })

  render () {
    const { post, loaded } = this.state

    return !loaded ? (
      <Loading />
    ) : (
      <Wrapper paddingTop={16}>
        <Block className={css(meta)} marginBottom={8}>
          {post.id} | {post.author} | Date Added:{' '}
          {format(post.dateAdded, 'HH:MM A, DD MMMM YYYY')}
        </Block>
        <Input
          inputRef={input => {
            this.titleInput = input
          }}
          value={post.title}
          onChange={e => this.updateTitle(e)}
        />
        <Wrapper className={css(editorShell, editorInner)}>
          <div className={css(editorContent)}>
            <Flex
              justifyContent='space-between'
              alignItems='center'
              className={css(toolbar)}>
              <Flex justifyContent='space-between'>
                <a onClick={() => console.log('h1')}>h1</a>
                <a onClick={() => console.log('h2')}>h2</a>
                <a onClick={() => console.log('bold')}>bold</a>
                <a onClick={() => console.log('italic')}>italic</a>
              </Flex>
              <Button onClick={() => console.log(post)}>Update</Button>
            </Flex>
            <Editor
              placeholder='Enter some rich text...'
              state={post.content}
              onChange={this.onChange}
              onDocumentChange={this.onDocumentChange}
            />
          </div>
        </Wrapper>
      </Wrapper>
    )
  }
}
