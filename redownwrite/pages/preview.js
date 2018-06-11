// @flow

import React, { Fragment, Component } from 'react'
import Head from 'next/head'
import isEmpty from 'lodash/isEmpty'
import styled from 'styled-components'
import 'universal-fetch'
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
    return !isEmpty(entry.message) && entry.message.length > 0 ? (
      <Fragment>
        <Head>
          <title>{entry.error} | Downwrite</title>
        </Head>
        <ErrorState {...entry} />
      </Fragment>
    ) : (
      <Fragment>
        <Head>
          <title>{entry.title} | Downwrite</title>
          <meta description={entry.content.substr(0, 75)} />
          <link
            rel="stylesheet"
            href="https://cloud.typography.com/7107912/7471392/css/fonts.css"
          />
        </Head>
        <Content {...entry} />
      </Fragment>
    )
  }
}
