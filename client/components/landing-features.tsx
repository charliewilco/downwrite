import * as React from "react";
import styled from "../types/styled-components";
import FeatureContent from "../markdown/features.md";

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
    <FeatureContent />
  </FeatureContainer>
);
