import * as React from 'react';
import styled from 'styled-components';
import { ExportIcon } from './icons';

const ExportButton = styled.button`
  border: 0;
  display: flex;
  align-items: center;
  font-family: inherit;
  appearance: none;
  color: inherit;
  line-height: inherit;
  background: none;
  box-sizing: inherit;
`;

const StyledExportIcon = styled(ExportIcon)`
  display: block;
  margin-right: 8px;
`;

const ExportLabel = styled.small`
  font-size: 12px;
`;

const ExportMarkdownButton: React.SFC<{ onClick: () => void }> = ({ onClick }) => (
  <ExportButton onClick={onClick}>
    <StyledExportIcon />
    <ExportLabel>Export</ExportLabel>
  </ExportButton>
);

export default ExportMarkdownButton;
