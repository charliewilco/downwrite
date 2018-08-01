// @flow

import React, { Fragment, Component } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import styled from 'styled-components'
import {
  RichUtils,
  EditorState,
  convertToRaw,
  getDefaultKeyBinding,
  KeyBindingUtil,
  type ContentState
} from 'draft-js'
import isEmpty from 'lodash/isEmpty'
import debounce from 'lodash/debounce'
import noop from 'lodash/noop'
import sanitize from '@charliewilco/sanitize-object'
import 'universal-fetch'

import Autosaving from '../components/autosaving-notification'
import ExportMarkdown from '../components/export'
import Input from '../components/input'
import Loading from '../components/loading'
import Helpers from '../components/helpers'
import Wrapper from '../components/wrapper'
import Privacy from '../components/privacy'
import TimeMarker from '../components/time-marker'
import { getToken, createHeader, superConverter } from '../utils/responseHandler'
import { POST_ENDPOINT } from '../utils/urls'

const LazyEditor = dynamic(import('../components/editor'), { loading: Loading })

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
  title?: string,
  post?: Object,
  editorState?: EditorState
}

const OuterEditor = styled.div`
  padding: 0 8px;
`

OuterEditor.displayName = 'OuterEditor'

const stateCreator: EditorState = post => ({
  autosaving: false,
  post,
  title: post.title || '',
  editorState: EditorState.createWithContent(superConverter(post.content)),
  updated: false,
  loaded: !isEmpty(post),
  unchanged: false,
  document: null,
  publicStatus: post.public,
  dateModified: new Date()
})

const EDITOR_COMMAND = 'myeditor-save'

function saveKeyListener(e: SyntheticKeyboardEvent): string {
  if (e.keyCode === 83 /* `S` key */ && KeyBindingUtil.hasCommandModifier(e)) {
    console.log(e.keyCode + 'called a save')
    return EDITOR_COMMAND
  }
  return getDefaultKeyBinding(e)
}

// TODO: Document this
// - Initial render
// - Rerouting
// - EditorState changes
// - Updating the post on the server

export default class Edit extends Component<EditorPr, EditorSt> {
  static displayName = 'EntryEdit'

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

  updatePostContent = ({ autosave }) => {
    let { post, title, dateModified, editorState, publicStatus } = this.state
    const { user } = this.props
    const cx: ContentState = editorState.getCurrentContent()
    const content = convertToRaw(cx)

    const postBody = sanitize(post, ['_id', '__v'])

    const newPost = {
      ...postBody,
      title,
      public: publicStatus,
      content,
      dateModified,
      user
    }

    const updater = () => this.setState({ autosaving: false })

    return this.updatePost(newPost).then(() => autosave && setTimeout(updater, 7500))
  }

  updateTitle = ({ target }: SyntheticInputEvent<*>) =>
    this.setState({ title: target.value })

  updatePrivacy = () =>
    this.setState(({ publicStatus }) => ({ publicStatus: !publicStatus }))

  handleKeyCommand = (command: string, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command)
    if (newState) {
      this.onChange(newState)
      return 'handled'
    }

    if (command === EDITOR_COMMAND) {
      this.updatePostContent({ autosave: false })
      return 'handled'
    }

    return 'not-handled'
  }

  componentDidMount() {
    // NOTE: Maybe this should only handle the fetch and not update the UI
    // this.autoSave = debounce(() => {
    //   this.setState({ autosaving: true }, this.updatePostContent({ autosave: true }))
    // }, 9000)
  }

  componentDidUpdate(nextProps) {
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
      <Fragment>
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
                <LazyEditor
                  editorState={editorState}
                  handleKeyCommand={this.handleKeyCommand}
                  keyBindingFn={saveKeyListener}
                  onChange={this.onChange}
                />
              )}
            </div>
          </OuterEditor>
        </Wrapper>
      </Fragment>
    )
  }
}
