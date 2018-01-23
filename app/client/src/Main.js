// @flow
import React, { Component } from 'react'
import { Block } from 'glamor/jsxstyle'
import orderBy from 'lodash/orderBy'
import { PostList, Loading, EmptyPosts, InvalidToken } from './components'
import { POST_ENDPOINT } from './utils/urls'

type Post = {
  title: string,
  id: string
}

type MainPr = {
  user: string,
  token: string,
  closeNav: Function
}

type MainState = {
  posts: Array<Post>,
  loaded: boolean,
  layout: 'grid' | 'list'
}

export default class Main extends Component<MainPr, MainState> {
  static displayName = 'Main View'

  state = {
    posts: [],
    loaded: false,
    layout: 'grid',
    error: false
  }

  layoutChange = (x: 'grid' | 'list') => {
    return this.setState({ layout: x })
  }

  getPosts = async () => {
    const config = {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.props.token}`
      },
      mode: 'cors',
      cache: 'default'
    }

    const response = await fetch(POST_ENDPOINT, config)
    const posts = await response.json()

    if (response.ok) {
      return this.setState({ posts: orderBy(posts, ['dateAdded'], ['desc']), loaded: true })
    } else {
      return this.setState({ error: posts.message, loaded: true })
    }
  }

  componentDidMount() {
    this.getPosts()
    this.props.closeNav()
  }

  onDelete = async (post: Object) => {
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
      return await this.getPosts()
    }
  }

  render() {
    const { loaded, posts, layout, error } = this.state
    return (
      <Block paddingLeft={8} paddingRight={8} paddingTop={16} paddingBottom={16} height="100%">
        {loaded ? (
          posts.length > 0 ? (
            <PostList
              layout={layout}
              onDelete={this.onDelete}
              layoutChange={this.layoutChange}
              posts={posts}
            />
          ) : error ? (
            <InvalidToken error={error} />
          ) : (
            <EmptyPosts />
          )
        ) : (
          <Loading size={100} />
        )}
      </Block>
    )
  }
}
