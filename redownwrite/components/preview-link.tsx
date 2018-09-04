import * as React from 'react'
import Link from 'next/link'
import styled from 'styled-components'

const PreviewAnchor = styled.a`
  display: block;
  font-size: 12px;
`

const PreviewLink: React.SFC<{ publicStatus: boolean, id: string }> = ({
  publicStatus,
  id
}) =>
  publicStatus && (
    <Link
      prefetch
      href={{ pathname: '/preview', query: { id } }}
      as={`/${id}/preview`}>
      <PreviewAnchor>Preview</PreviewAnchor>
    </Link>
  )

export default PreviewLink
