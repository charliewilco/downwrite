// @flow
import React from 'react'
import styled from 'styled-components'

type PostError = { message: string, error: string }

const ErrorContainer = styled.div`
  margin: 0 auto;
  padding: 8px;
  max-width: 512px;
  text-align: center;
  font-style: italic;
`

const ErrorTitle = styled.h4`
  font-size: 20px;
  margin-bottom: 16px;
`

const ErrorImage = styled.img`
  display: inline-block;
  margin-bottom: 16px;
  max-width: 25%;
`

export default ({ error, message }: PostError) => (
  <ErrorContainer>
    <ErrorImage
      alt="Document with an Negative mark"
      src="/static/entry-not-found.png"
    />
    <ErrorTitle>
      {error}. <br />Ummm... something went horribly wrong.
    </ErrorTitle>
    <p>{message}</p>
  </ErrorContainer>
)
