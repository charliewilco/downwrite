// @flow
import React, { Fragment } from 'react'
import Head from 'next/head'
import Content from '../components/content'
import { legalInfo } from '../utils/legalBoilerplate'

export default () => (
  <Fragment>
    <Head>
      <title>Legal Nonsense</title>
      <link
        rel="stylesheet"
        href="https://cloud.typography.com/7107912/7471392/css/fonts.css"
      />
    </Head>
    <Content content={legalInfo} />
  </Fragment>
)
