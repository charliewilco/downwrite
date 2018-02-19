// @flow

import React from 'react'
import type { Match, Location } from 'react-router-dom'
import { matchPath } from 'react-router-dom'
import { Block } from 'glamor/jsxstyle'
import { PREVIEW_ENDPOINT } from './utils/urls'
import { Content } from './components'
import type { Post } from './Dashboard'

const ErrorSt = ({ error, message }) => (
  <Block maxWidth={528} margin="auto" padding={8}>
    <p className="f6">{error}. Ummm... something went horribly wrong.</p>
    <i>{message}</i>
  </Block>
)

type PreviewProps = {
  match: Match | { params: { id: string } },
  location: Location
}

type PreviewState = {
  loading: boolean,
  error: boolean,
  post?: Post | { message: string, error: string } | Object
}

export default class extends React.Component<PreviewProps, PreviewState> {
  state = {
    loading: true,
    error: false,
    post: {}
  }

  static displayName = 'Preview'

  getPreview = async (id: string) => {
    const req = await fetch(`${PREVIEW_ENDPOINT}/${id}`, {
      mode: 'cors',
      cache: 'default'
    })

    const post = await req.json()

    return post
  }

  async componentWillMount() {
    const req = await this.getPreview(this.props.match.params.id)
    // TODO: This could be more function-like
    this.setState({ error: req.error, loading: false, post: req })
  }

  // TODO: Refactor this to do something smarter to render this component
  // See this is where recompose might be cool
  // I'm gonna need to take that back at some point
  // Will Next.js fix this?

  componentWillReceiveProps({ location }: { location: Location }) {
    if (location !== this.props.location) {
      const { params: { id } }: { params: { id: string } } = matchPath(location.pathname, {
        path: '/:id/preview'
      })
      this.getPreview(id).then(post => this.setState({ error: post.error, post }))
    }
  }

  render() {
    const { post, error, loading } = this.state
    return !loading && (error ? <ErrorSt {...post} /> : <Content {...post} />)
  }
}
