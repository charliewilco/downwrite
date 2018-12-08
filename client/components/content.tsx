import * as React from "react";
import styled from "../types/styled-components";
import format from "date-fns/format";
import isDate from "date-fns/is_date";
import Markdown from "react-markdown";
import "prismjs";
import CodeBlock from "./code-block";
import "./ganymede.css";
import * as DefaultStyles from "../utils/defaultStyles";

const WrapperExtended = styled.div`
  padding: 32px 0;
  max-width: 512px;
  margin-left: auto;
  margin-right: auto;
  font-family: ${DefaultStyles.fonts.sans};
`;

const ContentHeader = styled.header`
  text-align: center;
  margin-bottom: 32px;
  h1 {
    text-align: center;
    font-weight: 900;
  }
`;

const ContentTime = styled.time`
  opacity: 0.75;
  font-size: small;
`;

const ContentBody = styled.section`
  text-align: left;
  padding: 8px;
  margin-bottom: 64px;

  h2 {
    text-align: center;
    font-size: 24px;
    margin-bottom: 12px;
  }

  h3 {
    font-weight: 700;
    font-size: 20px;
    margin-bottom: 12px;
    text-align: center;
  }

  li > ul,
  li > ol {
    margin-bottom: 0;
  }

  ul,
  ol {
    list-style-position: inside;
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
    background: ${DefaultStyles.colors.blue100};
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
`;

interface IContentProps {
  title?: string;
  dateAdded?: Date;
  children?: React.ReactNode;
  content?: string;
}

const Content: React.SFC<IContentProps> = ({
  title,
  dateAdded,
  children,
  content
}) => (
  <WrapperExtended>
    <article className="harticle">
      <ContentHeader>
        <h1 data-testid="PREVIEW_ENTRTY_TITLE" className="u-center f4">
          {title}
        </h1>
        {dateAdded && (
          <ContentTime
            data-testid="PREVIEW_ENTRTY_META"
            dateTime={isDate(dateAdded) && dateAdded.toString()}>
            {format(dateAdded, "DD MMMM YYYY")}
          </ContentTime>
        )}
      </ContentHeader>
      <ContentBody data-testid="PREVIEW_ENTRTY_BODY" className="PreviewBody">
        {content && <Markdown source={content} renderers={{ code: CodeBlock }} />}
        {children}
      </ContentBody>
    </article>
  </WrapperExtended>
);

export default Content;
