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
import { colors, fonts } from '../utils/defaultStyles'

const CodeBlock = ({ language = 'javascript', value, ...props }) => (
  <pre>
    <PrismCode className={`language-${language || 'javascript'}`} children={value} />
  </pre>
)

const WrapperExtended = styled(Wrapper)`
  padding: 32px 0;
  max-width: 512px;
  font-family: ${fonts.serif};
`
const ContentBody = styled(Wrapper)`
  text-align: left;
  padding: 8px;
  margin-bottom: 64px;

  h2 {
    text-align: center;
    font-size: 24px;
    margin-bottom: 12px;
  }

  h3 {
    font-weight: 600;
    font-size: 20px;
    margin-bottom: 12px;
    text-align: center;
  }

  ul,
  ol,
  pre,
  p {
    margin-bottom: 24.6px;
  }

  p,
  li {
    line-height: 1.65;
    font-size: 14.6667px;
  }

  blockquote {
    font-style: italic;
    margin-bottom: 24px;
    background: ${colors.blue100};
    margin-left: -8px;
    margin-right: -8px;
  }

  /* TODO: There at some point be a notch to separate the content */
  blockquote::after {
  }

  blockquote p {
    padding: 16px;
    font-size: 106.25%;
  }

  @media (min-width: 48rem) {
    pre,
    blockquote {
      margin-left: -80px;
      margin-right: -80px;
    }

    blockquote p {
      font-size: 112.5%;
    }

    p,
    li {
      font-size: 15.625px;
    }
  }
`

const ContentHeader = styled.header`
  text-align: center;
  margin-bottom: 32px;
`

const ContentTime = styled.time`
  font-style: italic;
  opacity: 0.75;
`

export default ({ title, dateAdded, content }) => (
  <NightMode>
    <Helmet title={title} titleTemplate="%s | Downwrite" />
    <WrapperExtended>
      <article className="harticle">
        <ContentHeader>
          <h1 data-testid="PREVIEW_ENTRTY_TITLE" className="u-center f4">
            {title}
          </h1>
          {dateAdded && (
            <ContentTime data-testid="PREVIEW_ENTRTY_META" dateTime={dateAdded}>
              {format(dateAdded, 'DD MMMM YYYY')}
            </ContentTime>
          )}
        </ContentHeader>
        <ContentBody data-testid="PREVIEW_ENTRTY_BODY" className="PreviewBody">
          <Markdown source={content} renderers={{ code: CodeBlock }} />
        </ContentBody>
      </article>
    </WrapperExtended>
  </NightMode>
)
