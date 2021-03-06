import format from "date-fns/format";
import Markdown from "react-markdown";
import "prismjs";
import CodeBlock from "./code-block";
import { PropsWithChildren } from "react";
import { CodeComponent } from "react-markdown/src/ast-to-react";

interface IContentWrapperProps extends PropsWithChildren<{}> {
  title?: string;
  dateAdded?: Date;
}

export function ContentWrapper(props: IContentWrapperProps): JSX.Element {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 xl:max-w-5xl xl:px-0 mt-12">
      <article className="harticle">
        <header className="space-y-1 pt-6 pb-6 xl:pb-10 border-b border-onyx-200 mb-2">
          {props.dateAdded && (
            <time
              className="text-sm font-mono uppercase tracking-widest opacity-50 mb-4 block"
              data-testid="PREVIEW_ENTRTY_META"
              dateTime={props.dateAdded.toString()}>
              {format(new Date(props.dateAdded.toString()), "dd MMMM yyyy")}
            </time>
          )}
          <h1
            data-testid="PREVIEW_ENTRTY_TITLE"
            className="text-3xl leading-9 font-serif font-bold tracking-tight sm:text-4xl sm:leading-10 md:text-5xl md:leading-14">
            {props.title}
          </h1>
        </header>
        <section
          data-testid="PREVIEW_ENTRTY_BODY"
          className="divide-y xl:divide-y-0 divide-gray-200 xl:grid xl:grid-cols-4 xl:col-gap-8 pb-16 xl:pb-20"
          style={{
            gridTemplateRows: "auto 1fr"
          }}>
          {props.children}
        </section>
      </article>
    </div>
  );
}

interface IContentProps {
  title?: string;
  dateAdded?: Date;
  children?: React.ReactNode;
  content?: string;
}

const code: CodeComponent = (props) => {
  console.log(props);
  return <CodeBlock value={props.children} language={props.className} />;
};

const MARKDOWN_RENDERS = {
  code
};

export default function Content(props: IContentProps): JSX.Element {
  return (
    <ContentWrapper title={props.title} dateAdded={props.dateAdded}>
      <aside className="divide-y space-y-8 py-8">{props.children}</aside>
      {props.content && (
        <div className="xl:pb-0 xl:col-span-3 xl:row-span-2">
          <div className="font-serif __content py-8">
            <Markdown components={MARKDOWN_RENDERS}>{props.content}</Markdown>
          </div>
        </div>
      )}
    </ContentWrapper>
  );
}
