// @flow

import React, { Component } from 'react'
import styled from 'styled-components'
import { EditorState, convertToRaw, type ContentState } from 'draft-js'
import Helmet from 'react-helmet'
import { matchPath, type Location, type Match } from 'react-router-dom'
import {
  Autosaving,
  Input,
  NightMode,
  Loading,
  Wrapper,
  Helpers,
  DWEditor,
  Export,
  Privacy,
  WordCounter,
  TimeMarker
} from './components'
import isEmpty from 'lodash/isEmpty'
import debounce from 'lodash/debounce'
import { superConverter } from './utils/responseHandler'
import { POST_ENDPOINT } from './utils/urls'

type EditorSt = {
  title: string,
  post: Object,
  loaded: boolean,
  updated: boolean,
  editorState: EditorState,
  dateModified: Date,
  publicStatus: boolean,
  autosaving: boolean
}

type EditorPr = {
  token: string,
  user: string,
  location: Location,
  match: Match
}

const OuterEditor = styled.div`
  padding: 0 8px;
`

// TODO: Document this
// - Initial render
// - Rerouting
// - EditorState changes
// - Updating the post on the server

export default class Edit extends Component<EditorPr, EditorSt> {
  static displayName = 'Edit'

  titleInput: HTMLInputElement

  state = {
    autosaving: false,
    editorState: EditorState.createEmpty(),
    post: {},
    title: '',
    updated: false,
    loaded: false,
    unchanged: false,
    document: null,
    publicStatus: false,
    dateModified: new Date()
  }

  prepareContent: Function = (content: ContentState) => superConverter(content)

  updatePostContent = () => {
    let { post, title, dateModified, editorState, publicStatus } = this.state
    const { user } = this.props
    const cx: ContentState = editorState.getCurrentContent()
    const content = convertToRaw(cx)
    const { _id, __v, ...args } = post

    const newPost = {
      ...args,
      title,
      public: publicStatus,
      content,
      dateModified,
      user
    }

    return this.updatePost(newPost).then(() =>
      setTimeout(() => this.setState({ autosaving: false }), 3500)
    )
  }

  createHeader = (method: string) => {
    const h = new Headers()
    const { token } = this.props

    h.set('Authorization', `Bearer ${token}`)
    h.set('Content-Type', 'application/json')

    return {
      method,
      headers: h,
      mode: 'cors',
      cache: 'default'
    }
  }

  getPost = async (id: string) => {
    const config = this.createHeader('GET')

    const req = await fetch(`${POST_ENDPOINT}/${id}`, config)
    const post: Object = await req.json()

    return post
  }

  updatePost = (body: Object) => {
    const { match } = this.props
    const config = this.createHeader('PUT')
    const payload = { ...config, body: JSON.stringify(body) }

    return fetch(`${POST_ENDPOINT}/${match.params.id}`, payload)
  }

  shouldComponentUpdate(nextProps: Object, nextState: { post: Object }) {
    return isEmpty(nextState.post) || isEmpty(nextState.post.content.blocks)
  }

  // NOTE: Maybe this should only handle the fetch and not update the UI
  autoSave = debounce(() => {
    this.setState({ autosaving: true }, this.updatePostContent)
  }, 5000)

  // TODO: Consider this lifecycle hook is deprecated
  async componentDidMount() {
    const { match } = this.props
    const post = await this.getPost(match.params.id)
    const content = await superConverter(post.content)

    this.setState({
      post: {
        ...post,
        content
      },
      publicStatus: post.public,
      editorState: EditorState.createWithContent(content),
      title: post.title,
      loaded: true
    })
  }

  onChange = (editorState: EditorState) => {
    this.autoSave()
    this.setState({ editorState })
  }

  updateTitle = ({ target: EventTarget }: { target: EventTarget }) => {
    return this.setState(prevState => {
      let title = this.titleInput.value
      // target instanceof HTMLInputElement &&
      return {
        title: title
      }
    })
  }

  // TODO: Refactor this to do something smarter to render this component
  // See this is where recompose might be cool
  // I'm gonna need to take that back at some point
  // Will Next.js fix this?

  componentWillReceiveProps(nextProps: EditorPr) {
    if (nextProps.location !== this.props.location) {
      const { params: { id } } = matchPath(nextProps.location.pathname, { path: '/:id/edit' })

      this.getPost(id).then(post =>
        this.setState({
          post: {
            ...post,
            content: superConverter(post.content)
          },
          editorState: EditorState.createWithContent(superConverter(post.content)),
          title: post.title,
          loaded: true
        })
      )
    }
  }

  // Removes the no-op error when transitioning Location
  // Will need to account for any type of transitioning or auto updating other posts
  componentWillUnmount() {
    this.autoSave.flush()
  }

  updatePrivacy = () => this.setState(({ publicStatus }) => ({ publicStatus: !publicStatus }))

  render() {
    const { title, post, loaded, editorState, publicStatus, autosaving } = this.state
    const { match } = this.props

    return !loaded ? (
      <Loading />
    ) : (
      <NightMode>
        <Helmet title={title} titleTemplate="%s | Downwrite" />
        {autosaving && <Autosaving />}
        <Wrapper sm={true}>
          <Helpers onChange={this.updatePostContent} buttonText="Save">
            <Export editorState={editorState} title={title} date={post.dateAdded} />
            <Privacy
              id={match.params.id}
              title={title}
              publicStatus={publicStatus}
              onChange={this.updatePrivacy}
            />
            <WordCounter editorState={editorState} />
          </Helpers>
          <OuterEditor sm>
            <TimeMarker dateAdded={post.dateAdded} />
            <Input
              inputRef={input => (this.titleInput = input)}
              value={title}
              onChange={e => this.updateTitle(e)}
            />
            <div>
              {editorState !== null && (
                <DWEditor editorState={editorState} onChange={this.onChange} />
              )}
            </div>
          </OuterEditor>
        </Wrapper>
      </NightMode>
    )
  }
}
