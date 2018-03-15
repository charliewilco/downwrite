// @flow
import React, { Fragment, Component } from 'react'
import { Flex, Block } from 'glamor/jsxstyle'
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

type MainPr = {
  user: string,
  token: string,
  closeNav: Function
}

type MainState = {
  posts: Res,
  loaded: boolean,
  layout: 'grid' | 'list',
  selectedPost?: Post | {},
  modalOpen: boolean,
  error: string
}

export default class Main extends Component<MainPr, MainState> {
  static displayName = 'Dashboard'

  state = {
    posts: [],
    loaded: false,
    layout: 'grid',
    modalOpen: false,
    selectedPost: {},
    error: ''
  }

  layoutChange = (x: 'grid' | 'list') => {
    return this.setState({ layout: x })
  }

  getPosts = async (close: ?boolean) => {
    const config = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.props.token}`
      },
      mode: 'cors',
      cache: 'default'
    }

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
    this.props.closeNav()
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
    const { modalOpen, loaded, posts, layout, error, selectedPost } = this.state
    return (
      <Fragment>
        {modalOpen &&
          !isEmpty(selectedPost) && (
            <Modal closeUIModal={this.closeUIModal} sm>
              <Block>
                <Block marginBottom={16}>
                  <p className="h5">
                    Are you sure you want to delete <strong>"{selectedPost.title}"</strong>?
                  </p>
                </Block>
                <hr />
                <Flex justifyContent="flex-end">
                  <Cancel onClick={this.cancelDelete}>Cancel</Cancel>
                  <Button onClick={() => this.onDelete(selectedPost)}>Delete</Button>
                </Flex>
              </Block>
            </Modal>
          )}
        <Block
          paddingLeft={8}
          paddingRight={8}
          paddingTop={16}
          paddingBottom={16}
          height="100%">
          {loaded ? (
            Array.isArray(posts) && posts.length > 0 ? (
              <PostList
                layout={layout}
                onDelete={this.confirmDelete}
                layoutChange={this.layoutChange}
                posts={posts}
              />
            ) : error.length > 0 ? (
              <InvalidToken error={error} />
            ) : (
              <EmptyPosts />
            )
          ) : (
            <Loading size={100} />
          )}
        </Block>
      </Fragment>
    )
  }
}
