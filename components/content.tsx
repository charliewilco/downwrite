import * as React from "react";
import format from "date-fns/format";
import parseISO from "date-fns/parseISO";
import Markdown from "react-markdown";
import "prismjs";
import CodeBlock from "./code-block";

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
    <div className="PreviewContainer">
      <article className="harticle">
        <header className="PreviewContentHeader u-center">
          <h1
            data-testid="PREVIEW_ENTRTY_TITLE"
            className="ContentHeaderTitle u-center f4">
            {title}
          </h1>
          {dateAdded && (
            <time
              className="PreviewMeta"
              data-testid="PREVIEW_ENTRTY_META"
              dateTime={parseISO(dateAdded.toString()).toString()}>
              {format(parseISO(dateAdded.toString()), "dd MMMM yyyy")}
            </time>
          )}
        </header>
        <section
          data-testid="PREVIEW_ENTRTY_BODY"
          className="PreviewContentBody PreviewBody Wrapper Wrapper--sm">
          {content && <Markdown source={content} renderers={MARKDOWN_RENDERS} />}
          {children}
        </section>
      </article>
    </div>
  );
}
