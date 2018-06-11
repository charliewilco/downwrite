// @flow

import React, { Component } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import Router from 'next/router'
import styled from 'styled-components'
import { EditorState, convertToRaw, type ContentState } from 'draft-js'
import isEmpty from 'lodash/isEmpty'
import debounce from 'lodash/debounce'
import noop from 'lodash/noop'
import 'universal-fetch'

import Autosaving from '../components/autosaving-notification'
import ExportMarkdown from '../components/export'
import Input from '../components/input'
import NightMode from '../components/night-mode'
import loading from '../components/loading'
import Helpers from '../components/helpers'
import Wrapper from '../components/wrapper'
import Privacy from '../components/privacy'
import WordCounter from '../components/word-count'
import TimeMarker from '../components/time-marker'
import { getToken, createHeader, superConverter } from '../utils/responseHandler'
import { POST_ENDPOINT } from '../utils/urls'

const LazyEditor = dynamic(import('../components/editor'), { loading })

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

type Query = {
  params: {
    id: string
  }
}

type EditorPr = {
  token: string,
  user: string,
  location: Location,
  match: Match | Query,
  title?: string,
  post?: Object,
  editorState?: EditorState
}

const OuterEditor = styled.div`
  padding: 0 8px;
`

const stateCreator = post => ({
  autosaving: false,
  post,
  title: post.title || '',
  editorState: EditorState.createWithContent(superConverter(post.content)),
  updated: false,
  loaded: !isEmpty(post),
  unchanged: false,
  document: null,
  publicStatus: false,
  dateModified: new Date()
})

// TODO: Document this
// - Initial render
// - Rerouting
// - EditorState changes
// - Updating the post on the server

export default class Edit extends Component {
  static async getInitialProps({ req, query }) {
    const { id } = query
    const { token } = getToken(req, query)
    const config = createHeader('GET', token)

    const post = await fetch(`${POST_ENDPOINT}/${id}`, config).then(r => r.json())
    const content = await superConverter(post.content)

    return {
      token,
      post,
      editorState: EditorState.createWithContent(content),
      id
    }
  }

  autoSave = () => noop()

  state = stateCreator(this.props.post)

  onChange = (editorState: EditorState) => {
    this.autoSave()
    this.setState({ editorState })
  }

  updatePost = (body: Object) => {
    const { id, token } = this.props
    const config = createHeader('PUT', token)

    const payload = { ...config, body: JSON.stringify(body) }

    return fetch(`${POST_ENDPOINT}/${id}`, payload)
  }

  updatePostContent = () => {
    let { post, title, dateModified, editorState, publicStatus } = this.state
    const { user } = this.props
    const cx: ContentState = editorState.getCurrentContent()
    const content = convertToRaw(cx)
    const { _id, __v, ...postBody } = post

    const newPost = {
      ...postBody,
      title,
      public: publicStatus,
      content,
      dateModified,
      user
    }

    const updater = () => this.setState({ autosaving: false })

    return this.updatePost(newPost).then(() => setTimeout(updater, 3500))
  }

  updateTitle = ({ target }: SyntheticInputEvent<*>) =>
    this.setState({ title: target.value })

  updatePrivacy = () =>
    this.setState(({ publicStatus }) => ({ publicStatus: !publicStatus }))

  componentDidMount() {
    // NOTE: Maybe this should only handle the fetch and not update the UI
    this.autoSave = debounce(() => {
      this.setState({ autosaving: true }, this.updatePostContent)
    }, 5000)
  }

  componentDidUpdate(nextProps, nextState) {
    if (nextProps.route !== this.props.route && this.autoSave.flush) {
      this.autoSave.flush()
    }
  }

  // NOTE:
  // Removes the no-op error when transitioning Location
  // Will need to account for any type of transitioning or auto updating other posts
  componentWillUnmount() {
    if (this.autoSave.flush) {
      this.autoSave.flush()
    }
  }

  render() {
    const { title, post, loaded, editorState, publicStatus, autosaving } = this.state
    const { id } = this.props

    return !loaded ? (
      <Loading />
    ) : (
      <NightMode>
        <Head>
          <title>{title} | Downwrite</title>
        </Head>
        {autosaving && <Autosaving />}
        <Wrapper sm>
          <Helpers onChange={this.updatePostContent} buttonText="Save">
            {editorState !== null && (
              <ExportMarkdown
                editorState={editorState}
                title={title}
                date={post.dateAdded}
              />
            )}

            <Privacy
              id={id}
              title={title}
              publicStatus={publicStatus}
              onChange={this.updatePrivacy}
            />
            {/* {editorState !== null && <WordCounter editorState={editorState} />} */}
          </Helpers>
          <OuterEditor sm>
            <TimeMarker dateAdded={post.dateAdded} />
            <Input value={title} onChange={this.updateTitle} />
            <div>
              {editorState !== null && (
                <LazyEditor editorState={editorState} onChange={this.onChange} />
              )}
            </div>
          </OuterEditor>
        </Wrapper>
      </NightMode>
    )
  }
}
