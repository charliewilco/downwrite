// @flow
import React from 'react'
import { css } from 'glamor'
import { EditorState, convertToRaw, convertFromRaw } from 'draft-js'
import { Block } from 'glamor/jsxstyle'
import { Button, Input, Loading, Wrapper } from './components'
import format from 'date-fns/format'
import { DWEditor } from './components'

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
  paddingTop: 64
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
    editorState: EditorState.createEmpty(),
    post: {},
    title: '',
    updated: false,
    loaded: false,
    unchanged: false,
    document: null,
    dateModified: new Date()
  }

  prepareContent = (content: Object) => convertFromRaw(content)

  updateCurrent = (body: Object) => {
    fetch(`/posts/${this.props.match.params.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body
    }).then(() => this.setState({ post: body, updated: true }))
  }

  updatePostContent = () => {
    let { post, title, dateModified } = this.state
    let { author } = this.props
    const ContentState = this.state.editorState.getCurrentContent()
    const content = convertToRaw(ContentState)

    const newPost = {
      ...post,
      title,
      author,
      content,
      dateModified
    }

    return this.updatePost(newPost)
  }

  postToHapi = (post: Object) => {
    const newPost = {
      ...post,
      content: convertToRaw(post.content)
    }

    fetch('https://dwn-api.now.sh/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newPost)
    })
      .then(console.log)
      .then(() => console.log(newPost))
  }

  componentWillMount () {
    fetch(`/posts/${this.props.match.params.id}`)
      .then(res => res.json())
      .then(post => this.setState({ post }))
      .then(() =>
        this.setState({
          post: {
            ...this.state.post,
            content: convertFromRaw(this.state.post.content)
          },
          title: this.state.post.title,
          editorState: EditorState.createWithContent(
            convertFromRaw(this.state.post.content)
          ),
          loaded: true
        })
      )
  }

  onChange = (editorState: Object) => this.setState({ editorState })

  // onKeyDown = (e: Event) => console.log(e)

  updateTitle = ({ target }: { target: EventTarget }) =>
    this.setState(prevState => {
      let title = target instanceof HTMLInputElement && this.titleInput.value

      return { title }
    })

  updatePost = (body: Object) =>
    fetch(`/posts/${this.props.match.params.id}`, {
      method: 'put',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

  render () {
    const { title, post, loaded, editorState } = this.state

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
          value={title}
          onChange={e => this.updateTitle(e)}
        />
        <Wrapper>
          <div>
            <DWEditor
              editorState={editorState}
              onChange={editorState => this.onChange(editorState)}>
              {/* <Button onClick={() => this.updatePostContent()}>Update</Button> */}
              <Button onClick={() => this.postToHapi(post)}>Hapi</Button>
            </DWEditor>
          </div>
        </Wrapper>
      </Wrapper>
    )
  }
}
