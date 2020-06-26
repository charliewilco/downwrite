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

export default function Content(props: IContentProps): JSX.Element {
  return (
    <div className="PreviewContainer">
      <article className="harticle">
        <header className="PreviewContentHeader u-center">
          <h1
            data-testid="PREVIEW_ENTRTY_TITLE"
            className="ContentHeaderTitle u-center f4">
            {props.title}
          </h1>
          {props.dateAdded && (
            <time
              className="PreviewMeta"
              data-testid="PREVIEW_ENTRTY_META"
              dateTime={props.dateAdded.toString()}>
              {format(parseISO(props.dateAdded.toString()), "dd MMMM yyyy")}
            </time>
          )}
        </header>
        <section
          data-testid="PREVIEW_ENTRTY_BODY"
          className="PreviewContentBody PreviewBody Wrapper Wrapper--sm">
          {props.content && (
            <Markdown source={props.content} renderers={MARKDOWN_RENDERS} />
          )}
          {props.children}
        </section>
      </article>
    </div>
  );
}
