import React, { Fragment } from 'react'
import styled from 'styled-components'

const FeatureContainer = styled.article`
  max-width: 33rem;
  margin: 1rem auto 64px;
  font-size: 14px;

  h2 {
    font-size: 18px;
    margin-bottom: 4px;
  }
`

export default () => (
  <FeatureContainer>
    <h2>Focus on Markdown</h2>
    <p>
      Writing should be easy. But as each tool, each static site builder comes and
      falls out of popularity or gets shut down, **markdown** remains a central and
      portbale format.
    </p>

    <p>
      The goal of building Downwrite was to create a place to write and share content
      with that universal format
    </p>
  </FeatureContainer>
)
