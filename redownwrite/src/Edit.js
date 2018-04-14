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
  WordCounter
} from './components'
import format from 'date-fns/format'
import isEmpty from 'lodash/isEmpty'
import debounce from 'lodash/debounce'
import { superConverter } from './utils/responseHandler'
import { POST_ENDPOINT } from './utils/urls'

const Meta = styled.div`
  opacity: 0.5;
  font-size: small;
  margin-bottom: 8px;
`

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

const Time = ({ dateAdded }) => (
  <time dateTime={dateAdded}>{format(dateAdded, 'DD MMMM YYYY')}</time>
)

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

  getPost = async (id: string) => {
    const h = new Headers()
    const { token } = this.props

    h.set('Authorization', `Bearer ${token}`)

    const config = {
      method: 'GET',
      headers: h,
      mode: 'cors',
      cache: 'default'
    }

    const req = await fetch(`${POST_ENDPOINT}/${id}`, config)
    const post: Object = await req.json()

    return post
  }

  updatePost = (body: Object) => {
    const { token, match } = this.props
    return fetch(`${POST_ENDPOINT}/${match.params.id}`, {
      method: 'put',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    })
  }

  shouldComponentUpdate(nextProps: Object, nextState: { post: Object }) {
    return isEmpty(nextState.post) || isEmpty(nextState.post.content.blocks)
  }

  autoSave = debounce(() => {
    this.setState({ autosaving: true }, this.updatePostContent)
  }, 5000)

  // TODO: Consider this lifecycle hook is deprecated

  async componentWillMount() {
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
              onChange={() =>
                this.setState(({ publicStatus }) => ({
                  publicStatus: !publicStatus
                }))
              }
            />
            <WordCounter component={Meta} editorState={editorState} />
          </Helpers>
          <OuterEditor sm>
            <Meta>
              Added on <Time dateAdded={post.dateAdded} />
            </Meta>
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
