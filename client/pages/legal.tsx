import * as React from 'react';
import Head from 'next/head';
import Content from '../components/content';
// import Legal from '!raw-loader!../markdown/legal.md';
// import { legalInfo } from '../utils/legalBoilerplate';

export default () => (
  <>
    <Head>
      <title>Legal Nonsense</title>
    </Head>
    <Content title="Legal" content="## Legal" />
  </>
);
