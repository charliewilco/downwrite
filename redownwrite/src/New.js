// @flow
import * as React from 'react'
import withOfflineState from 'react-offline-hoc'
import Helmet from 'react-helmet'
import { EditorState, convertToRaw } from 'draft-js'
import { DWEditor } from './components'
import Upload from './components/Upload'
import { Redirect } from 'react-router-dom'
import Media from 'react-media'
import { Wrapper, Input, Button, Helpers } from './components'
import uuid from 'uuid/v4'
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

class NewX extends React.Component<NewPostProps, NewPostSt> {
  state = {
    editorState: EditorState.createEmpty(),
    title: '',
    id: uuid(),
    dateAdded: new Date(),
    error: '',
    drafts: [],
    saved: false
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

  addNewPost = () => {
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

    return this.addNew(post)
  }

  upload = (content: { title: string, editorState: EditorState }) => this.setState(content)

  render() {
    const { error, editorState, title, saved, id } = this.state

    return saved ? (
      <Redirect to={`/${id}/edit`} />
    ) : (
      <Media query={{ minWidth: 500 }}>
        {m => (
          <Wrapper paddingTop={128} sm>
            {error.length > 0 && <span className="f6 u-center">{error}</span>}
            <Helmet
              title={this.state.title.length > 0 ? this.state.title : 'New'}
              titleTemplate="%s | Downwrite"
            />
            {!this.props.isOnline && <span>You're Offline Right Now</span>}
            <Helpers render={() => <Button onClick={this.addNewPost}>Add</Button>} />
            <Wrapper sm paddingLeft={4} paddingRight={4}>
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
            </Wrapper>
          </Wrapper>
        )}
      </Media>
    )
  }
}

export default withOfflineState(NewX)
