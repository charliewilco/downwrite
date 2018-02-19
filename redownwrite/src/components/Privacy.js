import React from 'react'
import { Block, Flex } from 'glamor/jsxstyle'
import { Link } from 'react-router-dom'
import Check from './Checkbox'

const Privacy = ({ id, title, publicStatus, onChange }) => (
  <Block width="100%" maxWidth={512} marginBottom={16}>
    <h3 className="small" style={{ marginBottom: 16 }}>
      Public
    </h3>
    <small>
      <i>
        All posts are private by default, by selecting this option you're allowing anyone who
        has a URL to see the content.
      </i>
    </small>
    <Block>
      <Flex component="label" fontSize={12} padding="16px 0" alignItems="center">
        <Check checked={publicStatus} onChange={onChange} value={publicStatus} />
        <span
          style={{
            marginLeft: 8,
            display: 'inline-block',
            verticalAlign: 'middle',
            lineHeight: 1.2
          }}>
          <em>{title}</em> is <span>{publicStatus ? 'Public' : 'Private'}</span>
        </span>
      </Flex>
      {publicStatus && (
        <Link to={`/${id}/preview`} className="small">
          Preview <i>{title}</i>
        </Link>
      )}
    </Block>
  </Block>
)

export default Privacy
