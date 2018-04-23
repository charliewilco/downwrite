import React from 'react'
import styled from 'styled-components'
import Helmet from 'react-helmet'
import Markdown from 'react-markdown'
import PrismCode from 'react-prism'
import 'prismjs'
import NightMode from './NightMode'
import Wrapper from './Wrapper'
import './ganymede.css.js'
import format from 'date-fns/format'
import { fonts } from '../utils/defaultStyles'

const CodeBlock = ({ language, value, ...props }) => (
  <pre>
    <PrismCode className={`language-${language || 'javascript'}`} children={value} />
  </pre>
)

CodeBlock.defaultProps = {
  language: 'javascript'
}

const WrapperExtended = styled(Wrapper)`
  padding: 32px 0;
  max-width: 512px;
  font-family: ${fonts.serif};
`
const ContentBody = styled(Wrapper)`
  text-align: left;
`

export default ({ title, dateAdded, content }) => (
  <NightMode>
    <Helmet title={title} titleTemplate="%s | Downwrite" />
    <WrapperExtended>
      <article className="harticle">
        <header className="PreviewHeader">
          <h1 className="u-center f4">{title}</h1>
          {dateAdded && <time dateTime={dateAdded}>{format(dateAdded, 'DD MMMM YYYY')}</time>}
        </header>
        <ContentBody className="PreviewBody">
          <Markdown source={content} renderers={{ code: CodeBlock }} />
        </ContentBody>
      </article>
    </WrapperExtended>
  </NightMode>
)
