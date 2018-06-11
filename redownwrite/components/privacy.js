import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import Check from './checkbox'

const WARNING = `All posts are private by default, by selecting this option you're allowing anyone who has a URL to see the content.`

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

const PrivacyTitle = styled.h3`
  margin-bottom: 16px;
`

const PrivacyWarning = styled.small`
  font-size: 11px;
  font-style: italic;
`

const Privacy = ({ id, title, publicStatus, onChange }) => (
  <PrivacyContainer>
    <PrivacyTitle className="small">Public</PrivacyTitle>
    <PrivacyWarning>{WARNING}</PrivacyWarning>
    <div>
      <LabelFlex>
        <Check checked={publicStatus} onChange={onChange} value={publicStatus} />
        <Label>
          <em>{title}</em> is <span>{publicStatus ? 'Public' : 'Private'}</span>
        </Label>
      </LabelFlex>
      {publicStatus && (
        <Link
          prefetch
          href={{ pathname: '/preview', query: { id } }}
          as={`/${id}/preview`}>
          <a className="small">
            Preview <i>{title}</i>
          </a>
        </Link>
      )}
    </div>
  </PrivacyContainer>
)

export default Privacy
