import PrismCode from "react-prism";

interface ICodeBlockProps {
  language: string | "javascript";
  value: any;
}

export default function CodeBlock({
  language = "javascript",
  value,
  ...props
}: ICodeBlockProps) {
  console.log(language, value, props);
  const className = `language-${language || "javascript"}`;
  return <PrismCode component="pre" children={value} className={className} />;
}
