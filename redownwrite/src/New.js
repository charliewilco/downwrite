// @flow
import React, { Fragment, Component } from 'react'
import { Subscribe } from 'unstated'
import styled from 'styled-components'
import Helmet from 'react-helmet'
import { Redirect } from 'react-router-dom'
import { EditorState, convertToRaw } from 'draft-js'
import uuid from 'uuid/v4'
import { OfflineContainer } from './containers'
import { DWEditor, Upload, Wrapper, Input, Helpers } from './components'
import { POST_ENDPOINT } from './utils/urls'

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

type NewPostProps = { token: string, user: string }

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
    const response = await fetch(POST_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
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

  addNewPost = (offline: boolean) => {
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

    return saved ? (
      <Redirect to={`/${id}/edit`} />
    ) : (
      <SpacedWrapper sm>
        <Subscribe to={[OfflineContainer]}>
          {network => (
            <Fragment>
              {network.state.offline && <span>You're Offline Right Now</span>}
              <Helmet
                title={title.length > 0 ? title : 'New'}
                titleTemplate="%s | Downwrite"
              />

              <Helpers
                disabled={network.state.offline}
                buttonText="Add"
                onChange={() => this.addNewPost(network.state.offline)}
              />
              <EditorContainer sm>
                {error.length > 0 && <span className="f6 u-center">{error}</span>}
                <Upload upload={this.upload}>
                  <Input
                    placeholder="Untitled Document"
                    value={title}
                    onChange={e => this.setState({ title: e.target.value })}
                  />
                  <DWEditor
                    editorState={editorState}
                    onChange={editorState => this.setState({ editorState })}
                  />
                </Upload>
              </EditorContainer>
            </Fragment>
          )}
        </Subscribe>
      </SpacedWrapper>
    )
  }
}
