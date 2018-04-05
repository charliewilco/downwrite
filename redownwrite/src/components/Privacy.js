import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import Check from './Checkbox'

const WARNING = `
  All posts are private by default, by selecting this option
  you're allowing anyone who
  has a URL to see the content.
`

const PrivacyContainer = styled.div`
  width: 100%;
  max-width: 512px;
  margin-bottom: 16px;
`

const LabelFlex = styled.label`
  font-size: 12px;
  padding: 16px 0;
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

const Title = styled.h3`
  margin-bottom: 16px;
`

const Warning = styled.small`
  font-size: 11px
  font-style: italic;
`

const Privacy = ({ id, title, publicStatus, onChange }) => (
  <PrivacyContainer>
    <Title className="small">Public</Title>
    <Warning>{WARNING}</Warning>
    <div>
      <LabelFlex>
        <Check checked={publicStatus} onChange={onChange} value={publicStatus} />
        <Label>
          <em>{title}</em> is <span>{publicStatus ? 'Public' : 'Private'}</span>
        </Label>
      </LabelFlex>
      {publicStatus && (
        <Link to={`/${id}/preview`} className="small">
          Preview <i>{title}</i>
        </Link>
      )}
    </div>
  </PrivacyContainer>
)

export default Privacy
