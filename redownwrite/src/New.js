// @flow
import React, { Fragment, Component } from 'react'
import styled from 'styled-components'
import Helmet from 'react-helmet'
import Loadable from 'react-loadable'
import { Redirect } from 'react-router-dom'
import { EditorState, convertToRaw } from 'draft-js'
import uuid from 'uuid/v4'
import { Loading, Upload, Wrapper, Input, Helpers } from './components'
import { POST_ENDPOINT } from './utils/urls'
import { createHeader } from './utils/responseHandler'

const LazyEditor = Loadable({
  loader: () => import('./components/Draft'),
  loading: Loading
})

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
      this.setState({ saved: true })
    } else {
      this.setState({ error: newPost.message })
    }
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

  upload = (content: { title: string, editorState: EditorState }) => this.setState(content)

  render() {
    const { error, editorState, title, saved, id } = this.state
    const { offline } = this.props

    return saved ? (
      <Redirect to={`/${id}/edit`} />
    ) : (
      <SpacedWrapper sm>
        <Fragment>
          {offline && <span>You're Offline Right Now</span>}
          <Helmet title={title.length > 0 ? title : 'New'} titleTemplate="%s | Downwrite" />

          <Helpers disabled={offline} buttonText="Add" onChange={() => this.addNewPost()} />
          <EditorContainer sm>
            {error.length > 0 && <span className="f6 u-center">{error}</span>}
            <Upload upload={this.upload}>
              <Input
                placeholder="Untitled Document"
                value={title}
                onChange={e => this.setState({ title: e.target.value })}
              />
              <LazyEditor
                editorState={editorState}
                onChange={editorState => this.setState({ editorState })}
              />
            </Upload>
          </EditorContainer>
        </Fragment>
      </SpacedWrapper>
    )
  }
}
