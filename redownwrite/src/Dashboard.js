// @flow
import React, { Fragment, Component } from 'react'
import styled from 'styled-components'
import orderBy from 'lodash/orderBy'
import isEmpty from 'lodash/isEmpty'
import { type ContentState } from 'draft-js'
import {
  Modal,
  Cancel,
  Button,
  PostList,
  Loading,
  EmptyPosts,
  InvalidToken
} from './components'
import { createHeader } from './utils/responseHandler'
import { POST_ENDPOINT } from './utils/urls'

export type Post = {
  title: string,
  id: string,
  dateAdded: Date,
  dateModified: Date,
  public: boolean,
  content: ContentState
}

export type PostError = {
  error: string,
  message: string,
  statusCode: number
}

type Res = PostError | Array<Post>

type DashboardPr = {
  posts: Array<any>,
  user: string,
  token: string,
  closeNav: Function
}

type DashboardState = {
  posts: Res,
  loaded: boolean,
  selectedPost: ?Post | {},
  modalOpen: boolean,
  error: string
}

const ListContainer = styled.div`
  padding: 16px 8px;
  height: 100%;
`

const DeleteTray = styled.div`
  display: flex;
  justify-content: flex-end;
`

const DeleteBody = styled.div`
  margin-bottom: 16px;
  padding: 16px;
  max-width: 480px;
`

export default class Dashboard extends Component<DashboardPr, DashboardState> {
  static displayName = 'Dashboard'

  static defaultProps = {
    posts: []
  }

  static async getInitialData(params, token) {
    const config = createHeader('GET', token)
    return {
      posts: await fetch(POST_ENDPOINT, config).then(res => res.json())
    }
  }

  state = {
    posts: this.props.posts,
    loaded: this.props.posts.length > 0,
    modalOpen: false,
    selectedPost: {},
    error: ''
  }

  getPosts = async (close: ?boolean) => {
    const { token } = this.props
    const config = createHeader('GET', token)

    const response = await fetch(POST_ENDPOINT, config)
    const posts: Res = await response.json()

    if (Array.isArray(posts) || response.ok) {
      return this.setState({
        posts: orderBy(posts, ['dateAdded'], ['desc']),
        selectedPost: {},
        loaded: true,
        modalOpen: !close
      })
    } else if (typeof posts === 'object') {
      return this.setState({ error: posts.message, loaded: true, selectedPost: {} })
    }
  }

  componentDidMount() {
    this.getPosts()
  }

  closeUIModal = () => this.setState({ modalOpen: false })

  onDelete = async (post: Post, cb?: Function) => {
    const { token } = this.props

    const config = {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      },
      mode: 'cors',
      cache: 'default'
    }

    const response = await fetch(`${POST_ENDPOINT}/${post.id}`, config)

    if (response.ok) {
      return await this.getPosts(true)
    }
  }

  cancelDelete = () => this.setState({ selectedPost: {}, modalOpen: false })

  confirmDelete = (post: Post | {}) => this.setState({ selectedPost: post, modalOpen: true })

  // TODO: refactor to have selected post, deletion to be handled by a lower level component
  // should be opened at this level and be handed a token and post to delete
  render() {
    const { modalOpen, loaded, posts, error, selectedPost } = this.state
    return (
      <Fragment>
        {modalOpen &&
          !isEmpty(selectedPost) && (
            <Modal closeUIModal={this.closeUIModal} sm>
              <div>
                <DeleteBody>
                  <p className="h5">
                    Are you sure you want to delete <strong>"{selectedPost.title}"</strong>?
                  </p>
                </DeleteBody>
                <hr />
                <DeleteTray>
                  <Cancel onClick={this.cancelDelete}>Cancel</Cancel>
                  <Button onClick={() => this.onDelete(selectedPost)}>Delete</Button>
                </DeleteTray>
              </div>
            </Modal>
          )}
        <ListContainer>
          {loaded ? (
            Array.isArray(posts) && posts.length > 0 ? (
              <PostList onDelete={this.confirmDelete} posts={posts} />
            ) : error.length > 0 ? (
              <InvalidToken error={error} />
            ) : (
              <EmptyPosts />
            )
          ) : (
            <Loading size={100} />
          )}
        </ListContainer>
      </Fragment>
    )
  }
}
