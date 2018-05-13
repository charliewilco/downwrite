// @flow

import React, { Component } from 'react'
import isEmpty from 'lodash/isEmpty'
import { matchPath, type Match, type Location } from 'react-router-dom'
import styled from 'styled-components'
import { PREVIEW_ENDPOINT } from './utils/urls'
import { createHeader } from './utils/responseHandler'
import { Content } from './components'
import type { Post } from './Dashboard'

const ErrorContainer = styled.div`
  margin: 0 auto;
  padding: 8px;
  max-width: 512px;
`

const ErrorState = ({ error, message }) => (
  <ErrorContainer>
    <p className="f6">{error}. Ummm... something went horribly wrong.</p>
    <i>{message}</i>
  </ErrorContainer>
)

type PreviewProps = {
  post?: Post,
  match: Match | { params: { id: string } },
  location: Location
}

type PreviewState = {
  loading: boolean,
  error: boolean,
  post?: Post | { message: string, error: string } | {}
}

export default class extends Component<PreviewProps, PreviewState> {
  state = {
    loading: isEmpty(this.props.post),
    error: false,
    post: isEmpty(this.props.post) ? {} : this.props.post
  }

  static displayName = 'Preview'

  static async getInitialData({ query }, token: string) {
    const config = createHeader()
    const { id } = query.params
    const post = await fetch(`${PREVIEW_ENDPOINT}/${id}`, config).then(res => res.json())

    return {
      post
    }
  }

  getPreview = async (id: string) => {
    const config = createHeader()
    const req = await fetch(`${PREVIEW_ENDPOINT}/${id}`, config)
    const post = await req.json()

    return post
  }

  setPost = post => {
    if (post.error) {
      return { error: post.error, loading: false }
    } else {
      return { post, loading: false }
    }
  }

  async componentDidMount() {
    const post = await this.getPreview(this.props.match.params.id)

    this.setState(this.setPost(post))
  }

  async componentDidUpdate({ location }) {
    const currentLocation = this.props.location
    if (currentLocation !== location) {
      const match: Match = matchPath(currentLocation.pathname, { path: '/:id/preview' })
      const post = await this.getPreview(match.params.id)

      this.setState(this.setPost(post))
    }
  }

  render() {
    const { post, error, loading } = this.state
    return !loading && (error ? <ErrorState {...post} /> : <Content {...post} />)
  }
}
