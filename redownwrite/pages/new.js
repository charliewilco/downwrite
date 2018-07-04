// @flow
import React, { Fragment, Component } from 'react'
import styled from 'styled-components'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import Router from 'next/router'
import {
  RichUtils,
  EditorState,
  convertToRaw,
  getDefaultKeyBinding,
  KeyBindingUtil
} from 'draft-js'
import uuid from 'uuid/v4'
import 'universal-fetch'
import loading from '../components/loading'
import Wrapper from '../components/wrapper'
import Input from '../components/input'
import Upload from '../components/upload'
import Helpers from '../components/helpers'
import { POST_ENDPOINT } from '../utils/urls'
import { createHeader } from '../utils/responseHandler'

const LazyEditor = dynamic(import('../components/editor'), { loading, ssr: false })

type NewPostSt = {
  drafts: Array<any>,
  saved: boolean,
  editorState: EditorState,
  id: string,
  title: string,
  error?: string,
  dateAdded: Date,
  error: string
}

type NewPostProps = {
  offline?: boolean,
  token: string,
  user: string
}

const SpacedWrapper = styled(Wrapper)`
  padding-top: 128px;
`

const EditorContainer = styled(Wrapper)`
  padding: 0 4px;
`

function saveKeyListener(e: SyntheticKeyboardEvent): string {
  if (e.keyCode === 83 /* `S` key */ && KeyBindingUtil.hasCommandModifier(e)) {
    return EDITOR_COMMAND
  }
  return getDefaultKeyBinding(e)
}

export default class NewEditor extends Component<NewPostProps, NewPostSt> {
  state = {
    editorState: EditorState.createEmpty(),
    title: '',
    id: uuid(),
    dateAdded: new Date(),
    error: '',
    saved: false,
    drafts: []
  }

  static displayName = 'NewPostEditor'

  addNew = async (body: Object) => {
    const { token } = this.props
    const config = createHeader('POST', token)

    const response = await fetch(POST_ENDPOINT, {
      ...config,
      body: JSON.stringify(body)
    })

    const newPost = await response.json()

    if (!newPost.error) {
      Router.push(`/${this.state.id}/edit`)
    } else {
      this.setState({ error: newPost.message })
    }
  }

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

  saveLocalDraft = (id: string, post: Object) =>
    localStorage.setItem('Draft ' + id, JSON.stringify(post))

  addNewPost = (offline?: boolean) => {
    let { id, title, editorState, dateAdded } = this.state
    const ContentState = editorState.getCurrentContent()
    const content = JSON.stringify(convertToRaw(ContentState))
    const { user } = this.props

    const post: Object = {
      title: title.length > 0 ? title : `Untitled ${id}`,
      id,
      content,
      dateAdded,
      public: false,
      user
    }

    return offline ? this.saveLocalDraft(id, post) : this.addNew(post)
  }

  onChange = editorState => this.setState({ editorState })

  handleKeyCommand = (command: string, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command)
    if (newState) {
      this.onChange(newState)
      return 'handled'
    }

    if (command === EDITOR_COMMAND) {
      this.addNewPost()
      return 'handled'
    }

    return 'not-handled'
  }

  upload = (content: { title: string, editorState: EditorState }) =>
    this.setState(content)

  render() {
    const { error, editorState, title } = this.state
    const { offline } = this.props

    return (
      <SpacedWrapper sm>
        <Fragment>
          <Head>
            <title>{title.length > 0 ? title : 'New'} | Downwrite</title>
          </Head>
          {offline && <span>You're Offline Right Now</span>}

          <Helpers
            disabled={offline}
            buttonText="Add"
            onChange={() => this.addNewPost()}
          />
          <EditorContainer sm>
            {error.length > 0 && <span className="f6 u-center">{error}</span>}
            <Upload upload={this.upload}>
              <Input
                placeholder="Untitled Document"
                value={title}
                onChange={e => this.setState({ title: e.target.value })}
              />
              <LazyEditor
                keyBindingFn={keyBindingFn}
                editorState={editorState}
                onChange={this.onChange}
              />
            </Upload>
          </EditorContainer>
        </Fragment>
      </SpacedWrapper>
    )
  }
}
