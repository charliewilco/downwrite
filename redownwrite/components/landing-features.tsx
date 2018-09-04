import * as React from 'react';
import styled from 'styled-components';

const FeatureContainer = styled.section`
  max-width: 33rem;
  margin: 1rem auto 0;
  font-size: 14px;
  text-align: left;

  h2 {
    font-size: 18px;
    margin-bottom: 4px;
  }

  p:not(:last-of-type) {
    margin-bottom: 16px;
  }
`;

export default () => (
  <FeatureContainer>
    <h2>Focus on Markdown</h2>
    <p>
      Writing should be easy. But as each tool, each static site builder comes and
      falls out of popularity or gets shut down, <b>**markdown**</b> remains the
      central and portbale format.
    </p>

    <p>
      The goal of building Downwrite was to create a place to write and share content
      with that universal format; to be able to import and export in markdown, to
      write in markdown and share your work.
    </p>

    <p>
      <i>_Sign up below and get to writing._</i>
    </p>
  </FeatureContainer>
);
