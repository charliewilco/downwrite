// @flow
import React, { Component } from 'react'
import Head from 'next/head'
import styled from 'styled-components'
import Wrapper from '../components/wrapper'

const CenteredWrapper = styled(Wrapper)`
  text-align: center;
  padding: 8rem 1rem;
`

const Title = styled.h2`
  display: inline-block;
  margin-bottom: 32px;
  font-size: 84px;
  line-height: 1;
  font-weight: 100;
`

const StatusCode = ({ code }) => (
  <p>
    {code ? `An error ${code} occurred on server` : 'An error occurred on client'}
  </p>
)

export default class Error extends Component {
  static getInitialProps({ res, err }) {
    const statusCode = res ? res.statusCode : err ? err.statusCode : null
    return { statusCode }
  }

  render() {
    const { statusCode } = this.props
    return (
      <CenteredWrapper>
        <Head>
          <title>Not Found | Downwrite</title>
        </Head>
        <Title>404</Title>
        <StatusCode code={statusCode} />
      </CenteredWrapper>
    )
  }
}
