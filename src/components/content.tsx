import css from "styled-jsx/css";
import { useEffect, useRef } from "react";
import Prism from "prismjs";

import format from "date-fns/format";
import Markdown from "react-markdown";
import "prismjs";
import { CodeComponent } from "react-markdown/lib/ast-to-react";

interface IContentWrapperProps {
  title?: string;
  dateAdded?: Date;
}

interface ICodeBlockProps {
  language: string | "javascript";
  value: any;
}

function CodeBlock({ language = "javascript", value }: ICodeBlockProps) {
  const domRef = useRef(null);

  useEffect(() => {
    Prism.highlightElement(domRef.current, false);
  }, [value]);
  return (
    <pre>
      <code ref={domRef} className={`language-${language || "javascript"}`}>
        {value}
      </code>
    </pre>
  );
}

const content = css.global`
  .__content h2 {
    font-size: 2rem;
    font-weight: 800;
    margin-bottom: 1.5rem;
  }

  .__content h3 {
    font-weight: 700;
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .__content li > ul,
  .__content li > ol {
    margin-bottom: 0;
  }

  .__content ul,
  .__content ol {
    list-style-position: inside;
  }

  .__content ul,
  .__content ol,
  .__content pre,
  .__content hr,
  .__content p {
    margin-bottom: 1.5rem;
  }

  .__content p,
  .__content li {
    line-height: 1.625;
  }

  .__content blockquote {
    font-style: italic;
    background: #d4ecfe;
    margin-bottom: 1.5rem;
    color: #e3e4e4;
  }

  .__content blockquote p {
    padding: 1rem;
  }
`;

export const ContentWrapper: React.FC<IContentWrapperProps> = (props) => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 xl:max-w-5xl xl:px-0 mt-12">
      <article className="harticle">
        <header>
          {props.dateAdded && (
            <time
              data-testid="PREVIEW_ENTRTY_META"
              dateTime={props.dateAdded.toString()}>
              {format(new Date(props.dateAdded.toString()), "dd MMMM yyyy")}
            </time>
          )}
          <h1 data-testid="PREVIEW_ENTRTY_TITLE">{props.title}</h1>
        </header>
        <section data-testid="PREVIEW_ENTRTY_BODY" className="__content">
          {props.children}
        </section>
      </article>
      <style jsx>
        {`
          div {
            max-width: 48rem;
            margin: 1rem auto;
          }
          article {
            font-family: var(--serif);
          }

          header {
            padding: 1.5rem 0;
          }

          time {
            opacity: 50%;
            font-family: var(--monospace);
          }

          h1 {
            font-size: 2rem;
            font-weight: 900;
          }
        `}
      </style>
      <style jsx global>
        {content}
      </style>
    </div>
  );
};

interface IContentProps {
  title?: string;
  dateAdded?: Date;
  content?: string;
}

const code: CodeComponent = (props) => {
  return <CodeBlock value={props.children} language={props.className} />;
};

const MARKDOWN_RENDERS = {
  code
};

export const Content: React.FC<IContentProps> = (props) => {
  return (
    <ContentWrapper title={props.title} dateAdded={props.dateAdded}>
      <aside>{props.children}</aside>
      {props.content && (
        <Markdown components={MARKDOWN_RENDERS}>{props.content}</Markdown>
      )}
    </ContentWrapper>
  );
};
