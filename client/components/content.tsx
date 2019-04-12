import * as React from "react";
import format from "date-fns/format";
import isDate from "date-fns/is_date";
import Markdown from "react-markdown";
import "prismjs";
import CodeBlock from "./code-block";
import * as DefaultStyles from "../utils/defaultStyles";

interface IContentProps {
  title?: string;
  dateAdded?: Date;
  children?: React.ReactNode;
  content?: string;
}

const MARKDOWN_RENDERS = {
  code: CodeBlock
};

export default function Content({
  title,
  dateAdded,
  children,
  content
}: IContentProps) {
  return (
    <div className="Container">
      <article className="harticle">
        <header className="ContentHeader">
          <h1
            data-testid="PREVIEW_ENTRTY_TITLE"
            className="ContentHeaderTitle u-center f4">
            {title}
          </h1>
          {dateAdded && (
            <time
              data-testid="PREVIEW_ENTRTY_META"
              dateTime={isDate(dateAdded) && dateAdded.toString()}>
              {format(dateAdded, "DD MMMM YYYY")}
            </time>
          )}
        </header>
        <section
          data-testid="PREVIEW_ENTRTY_BODY"
          className="ContentBody PreviewBody">
          {content && <Markdown source={content} renderers={MARKDOWN_RENDERS} />}
          {children}
        </section>
      </article>
      <style jsx>{`
        .Container {
          padding: 32px 0;
          max-width: 512px;
          margin-left: auto;
          margin-right: auto;
          font-family: ${DefaultStyles.Fonts.sans};
        }
        .ContentHeader {
          text-align: center;
          margin-bottom: 32px;
        }

        .ContentHeaderTitle {
          text-align: center;
          font-weight: 900;
        }

        .ContentBody {
          text-align: left;
          padding: 8px;
          margin-bottom: 64px;
        }

        time {
          opacity: 0.75;
          font-size: small;
        }

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
        hr,
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
      `}</style>
    </div>
  );
}
