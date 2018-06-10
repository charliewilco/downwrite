// @flow

import React, { Fragment, Component } from 'react'
import Head from 'next/head'
import isEmpty from 'lodash/isEmpty'
import styled from 'styled-components'
import Content from '../components/content'
import { PREVIEW_ENDPOINT, POST_ENDPOINT } from '../utils/urls'
import { createHeader, getToken } from '../utils/responseHandler'

import type { Post } from './'

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

let PREVIEW_FONTS: string =
  'https://cloud.typography.com/7107912/7471392/css/fonts.css'

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

//
// class Preview {
//   state = {
//     loading: isEmpty(this.props.entry),
//     error: {},
//     post: this.props.entry
//   }
//
//   getPreview = async (id: string) => {
//     const config = createHeader()
//     const post = await fetch(`${PREVIEW_ENDPOINT}/${id}`, config).then(res =>
//       res.json()
//     )
//
//     return post
//   }
//
//   setPost = (post: StatedPost) => {
//     if (post.error) {
//       return { error: post.error, loading: false, post: {} }
//     } else {
//       return { post, loading: false, error: {} }
//     }
//   }
//
//   loadNewPreview = async (id: string) => {
//     const post: StatedPost = await this.getPreview(id)
//
//     this.setState(this.setPost(post))
//   }
//
//   async componentDidUpdate({ location }: { location: Location }) {
//     const currentLocation: Location = this.props.location
//     if (currentLocation !== location) {
//       const match: Match = matchPath(currentLocation.pathname, {
//         path: '/:id/preview'
//       })
//       const post: StatedPost = await this.getPreview(match.params.id)
//
//       this.setState(this.setPost(post))
//     }
//   }
// }

export default class extends Component<PreviewProps> {
  static async getInitialProps({ req, query }) {
    let { id } = query

    const config = { method: 'GET', mode: 'cors' }
    const url = `${PREVIEW_ENDPOINT}/${id}`

    const entry = await fetch(url, config).then(res => res.json())

    return {
      id,
      entry
    }
  }

  static defaultProps = {
    post: {}
  }

  static displayName = 'Preview'

  render() {
    const { entry } = this.props
    return (
      <Fragment>
        <Head>
          <title>{entry.title} | Downwrite</title>
          <link
            rel="stylesheet"
            href="https://cloud.typography.com/7107912/7471392/css/fonts.css"
          />
        </Head>

        {!isEmpty(entry.message) && entry.message.length > 0 ? (
          <ErrorState {...entry} />
        ) : (
          <Content {...entry} />
        )}
      </Fragment>
    )
  }
}
