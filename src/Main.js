// @flow
import React, { Component } from 'react'
import { Block } from 'glamor/jsxstyle'
import { PostList, Loading, EmptyPosts } from './components'

export default class extends Component {
  static displayName = 'Main View'

  state = {
    posts: [],
    loaded: false,
    layout: 'grid'
  }

  layoutChange = (x: string) => this.setState({ layout: x })

  getPosts = () =>
    fetch('/posts')
      .then(res => res.json())
      .then(posts => this.setState({ posts, loaded: true }))
      .catch(err => console.error(err))

  componentWillMount () {
    this.getPosts()
  }

  onDelete = (post: Object) =>
    fetch(`/posts/${post.id}`, {
      method: 'DELETE'
    }).then(() => this.getPosts())

  render () {
    const { loaded, posts, layout } = this.state
    return (
      <Block padding={16} height='100%'>
        {loaded ? posts.length > 0 ? (
          <PostList
            layout={layout}
            onDelete={this.onDelete}
            layoutChange={this.layoutChange}
            posts={posts}
          />
        ) : (
          <EmptyPosts />
        ) : (
          <Loading size={100} />
        )}
      </Block>
    )
  }
}
