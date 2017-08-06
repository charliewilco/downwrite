// @flow
import React, { Component } from 'react'
import { Block } from 'glamor/jsxstyle'
import PostList from './components/PostList'
import Loading from './components/Loading'
import EmptyPosts from './components/EmptyPosts'

export default class extends Component {
  static displayName = 'Main View'

  state = {
    posts: [],
    loaded: false,
    data: {}
  }

  serverTest = () => {
    return fetch('http://localhost:4411/stuff')
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
        <Block>{data && <h6>{data.post}</h6>}</Block>
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
