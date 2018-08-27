import React from 'react'
import styled from 'styled-components'
import Check from './checkbox'

const PrivacyContainer = styled.div`
  margin-right: 16px;
`

const LabelFlex = styled.label`
  font-size: 12px;
  display: flex;
  align-items: center;
`

const Label = styled.span`
  flex: 1;
  margin-left: 8px;
  display: inline-block;
  vertical-align: middle;
  line-height: 1.2;
`

const Privacy = ({ id, publicStatus, onChange }) => (
  <PrivacyContainer>
    <LabelFlex>
      <Check checked={publicStatus} onChange={onChange} value={publicStatus} />
      <Label>{publicStatus ? 'Public' : 'Private'}</Label>
    </LabelFlex>
  </PrivacyContainer>
)

export default Privacy
