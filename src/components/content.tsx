import ContentWrapper from "./content-wrapper";
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
    <ContentWrapper title={props.title} dateAdded={props.dateAdded}>
      <aside className="divide-y space-y-8 py-8">{props.children}</aside>
      {props.content && (
        <div className="xl:pb-0 xl:col-span-3 xl:row-span-2">
          <div className="font-serif __content py-8">
            <Markdown source={props.content} renderers={MARKDOWN_RENDERS} />
          </div>
        </div>
      )}
    </ContentWrapper>
  );
}
