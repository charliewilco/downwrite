// @flow

import React, { Fragment, Component } from 'react'
import Head from 'next/head'
import isEmpty from 'lodash/isEmpty'
import 'universal-fetch'
import Content from '../components/content'
import NotFound from '../components/not-found'
import { PREVIEW_ENDPOINT } from '../utils/urls'

import type { Post } from './'

type PostError = { message: string, error: string }

type StatedPost = Post | PostError | { [any]: empty }

type Query = {
  params: {
    id: string
  }
}

type PreviewProps = {
  entry: StatedPost,
  match: Query,
  error?: PostError,
  location: Location
}

let PREVIEW_FONTS: string =
  'https://cloud.typography.com/7107912/7471392/css/fonts.css'

export default class PreviewEntry extends Component<PreviewProps, void> {
  static async getInitialProps({ query }) {
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
    entry: {}
  }

  static displayName = 'PreviewEntry'

  render() {
    const { entry } = this.props

    return (
      <Fragment>
        {!isEmpty(entry.message) && entry.message.length > 0 ? (
          <Fragment>
            <Head>
              <title>{entry.error} | Downwrite</title>
            </Head>
            <NotFound {...entry} />
          </Fragment>
        ) : (
          <Fragment>
            <Head>
              <title>{entry.title} | Downwrite</title>
              <meta description={entry.content.substr(0, 75)} />
              <link rel="stylesheet" href={PREVIEW_FONTS} />
            </Head>
            <Content {...entry} />
          </Fragment>
        )}
      </Fragment>
    )
  }
}
