import * as React from 'react'
import Head from 'next/head'
import Content from '../components/content'

import { legalInfo } from '../utils/legalBoilerplate'

export default () => (
  <>
    <Head>
      <title>Legal Nonsense</title>
    </Head>
    <Content content={legalInfo} />
  </>
)
