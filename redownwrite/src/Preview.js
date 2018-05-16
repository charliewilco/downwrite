// @flow

import React, { Component } from 'react'
import isEmpty from 'lodash/isEmpty'
import { matchPath, type Match, type Location } from 'react-router-dom'
import styled from 'styled-components'
import { PREVIEW_ENDPOINT } from './utils/urls'
import { createHeader } from './utils/responseHandler'
import { Content } from './components'
import type { Post } from './Dashboard'

type PostError = { message: string, error: string }

type StatedPost = Post | PostError | { [any]: empty }

type Query = {
  params: {
    id: string
  }
}

type PreviewProps = {
  post: StatedPost,
  match: Query,
  location: Location
}

type PreviewState = {
  loading: boolean,
  error?: PostError,
  post: StatedPost
}

const ErrorContainer = styled.div`
  margin: 0 auto;
  padding: 8px;
  max-width: 512px;
`

const ErrorState = ({ error, message }: PostError) => (
  <ErrorContainer>
    <p className="f6">{error}. Ummm... something went horribly wrong.</p>
    <i>{message}</i>
  </ErrorContainer>
)

export default class extends Component<PreviewProps, PreviewState> {
  state = {
    loading: isEmpty(this.props.post),
    error: {},
    post: this.props.post
  }

  static defaultProps = {
    post: {}
  }

  static displayName = 'Preview'

  static async getInitialData({ query }: { query: Query }, token: string) {
    const config = createHeader()
    const { id } = query.params
    const post = await fetch(`${PREVIEW_ENDPOINT}/${id}`, config).then(res => res.json())

    return {
      post
    }
  }

  getPreview = async (id: string) => {
    const config = createHeader()
    const post = await fetch(`${PREVIEW_ENDPOINT}/${id}`, config).then(res => res.json())

    return post
  }

  setPost = (post: StatedPost) => {
    if (post.error) {
      return { error: post.error, loading: false, post: {} }
    } else {
      return { post, loading: false, error: {} }
    }
  }

  async componentDidMount() {
    const post: StatedPost = await this.getPreview(this.props.match.params.id)

    this.setState(this.setPost(post))
  }

  async componentDidUpdate({ location }: { location: Location }) {
    const currentLocation: Location = this.props.location
    if (currentLocation !== location) {
      const match: Match = matchPath(currentLocation.pathname, { path: '/:id/preview' })
      const post: StatedPost = await this.getPreview(match.params.id)

      this.setState(this.setPost(post))
    }
  }

  render() {
    const { post, error, loading } = this.state
    return (
      !loading &&
      (!isEmpty(error) && error.message.length > 0 ? (
        <ErrorState {...error} />
      ) : (
        <Content {...post} />
      ))
    )
  }
}
