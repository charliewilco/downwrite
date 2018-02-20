// @flow

import * as React from 'react'
import { css } from 'glamor'
import { EditorState, convertToRaw } from 'draft-js'
import type { ContentState } from 'draft-js'
import Helmet from 'react-helmet'
import Media from 'react-media'
import { matchPath } from 'react-router-dom'
import type { Location, Match } from 'react-router'
import { Block } from 'glamor/jsxstyle'
import {
  Button,
  Input,
  NightMode,
  Loading,
  Wrapper,
  Helpers,
  DWEditor,
  Export,
  Privacy
} from './components'
import Autosaving from './components/AutosavingNotification.js'
import format from 'date-fns/format'
import isEmpty from 'lodash/isEmpty'
import debounce from 'lodash/debounce'
import { superConverter } from './utils/responseHandler'
import { POST_ENDPOINT } from './utils/urls'

const meta = css({
  opacity: 0.5,
  fontSize: 'small'
})

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
  match: {
    params: {
      id: string
    }
  }
}

// TODO: Document this
// - Initial render
// - Rerouting
// - EditorState changes
// - Updating the post on the server

const { Component, Fragment } = React

class Edit extends Component<EditorPr, EditorSt> {
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

  shouldComponentUpdate(nextProps: Object, nextState: { post: Object }) {
    return isEmpty(nextState.post) || isEmpty(nextState.post.content.blocks)
  }

  autoSave = debounce(() => {
    this.setState({ autosaving: true }, this.updatePostContent)
  }, 5000)

  // TODO: Consider this lifecycle hook is deprecated

  async componentWillMount() {
    const post = await this.getPost(this.props.match.params.id)
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

  // TODO: Refactor this to do something smarter to render this component
  // See this is where recompose might be cool
  // I'm gonna need to take that back at some point
  // Will Next.js fix this?

  // TODO: Consider this lifecycle hook is deprecated

  componentWillReceiveProps({ location }: { location: Location }) {
    if (location !== this.props.location) {
      const { params: { id } } = matchPath(location.pathname, { path: '/:id/edit' })

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
        <Media query={{ minWidth: 500 }}>
          {m => (
            <Fragment>
              {autosaving && <Autosaving />}
              <Wrapper sm>
                <Helpers
                  render={() => (
                    <Block maxWidth={96}>
                      <Button onClick={() => this.updatePostContent()}>Save</Button>
                    </Block>
                  )}>
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
                </Helpers>
                <Wrapper sm paddingTop={0} paddingLeft={8} paddingRight={8}>
                  <Block className={css(meta)} marginBottom={8}>
                    Added on{' '}
                    <time dateTime={post.dateAdded}>
                      {format(post.dateAdded, 'DD MMMM YYYY')}
                    </time>
                  </Block>
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
                </Wrapper>
              </Wrapper>
            </Fragment>
          )}
        </Media>
      </NightMode>
    )
  }
}

export default Edit
