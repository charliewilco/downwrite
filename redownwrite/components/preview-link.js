import Link from 'next/link'
import styled from 'styled-components'

const PreviewAnchor = styled.a`
  display: block;
  font-size: 12px;
`

export default ({ publicStatus, id }) =>
  publicStatus && (
    <Link
      prefetch
      href={{ pathname: '/preview', query: { id } }}
      as={`/${id}/preview`}>
      <PreviewAnchor className="small">Preview</PreviewAnchor>
    </Link>
  )
