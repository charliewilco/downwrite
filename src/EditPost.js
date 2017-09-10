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
    updated: false,
    loaded: false,
    unchanged: false,
    document: null,
    dateModified: new Date()
  }

  prepareContent = (content: Object) => convertFromRaw(content)

  updateCurrent = (body: Object) =>
    fetch('/posts', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body
    }).then(() => this.setState({ updated: true }))

  updatePost = () => {
    let { id, title, document, dateAdded } = this.state
    let { author } = this.props
    const content = convertToRaw(this.state.editorState)

    const post = JSON.stringify({
      title,
      id,
      author,
      content,
      dateAdded,
      document
    })

    return this.updateCurrent(post)
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
          editorState: EditorState.createWithContent(
            convertFromRaw(this.state.post.content)
          ),
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
    const { post, loaded, editorState } = this.state

    return !loaded ? (
      <Loading />
    ) : (
      <Wrapper>
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
        <Wrapper>
          <div>
            <DWEditor
              editorState={editorState}
              onChange={editorState => this.setState({ editorState })}>
              <Button onClick={() => console.log(post)}>Update</Button>
            </DWEditor>
          </div>
        </Wrapper>
      </Wrapper>
    )
  }
}
