// @flow
import React, { Component } from 'react'
import { Block } from 'glamor/jsxstyle'
import { APIStatus, PostList, Loading, EmptyPosts } from './components'

export default class extends Component {
  static displayName = 'Main View'

  state = {
    posts: [],
    loaded: false,
    data: {}
  }

  serverTest = () => {
    return fetch('https://dwn-api.now.sh/stuff')
      .then(res => res.json())
      .then(data => this.setState({ data }))
      .catch(err => console.error(err))
  }

  componentWillMount () {
    fetch('/posts')
      .then(res => res.json())
      .then(posts => this.setState({ posts, loaded: true }, this.serverTest))
      .catch(err => this.setState({ loaded: false }, console.error(err)))
  }

  render () {
    const { loaded, posts, data } = this.state
    return (
      <Block padding={16} height='100%'>
        {
          process.env.NODE_ENV === 'development' && (
            <APIStatus data={data} env={process.env.NODE_ENV} />
          )
        }
        {loaded ? posts.length > 0 ? (
          <PostList posts={posts} />
        ) : (
          <EmptyPosts />
        ) : (
          <Loading size={100} />
        )}
      </Block>
    )
  }
}
