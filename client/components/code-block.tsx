import * as React from "react";
import PrismCode from "react-prism";

interface ICodeBlockProps {
  language: string | "javascript";
  value: any;
}

export default function CodeBlock({
  language = "javascript",
  value
}: ICodeBlockProps) {
  return React.createElement(
    "pre",
    {},
    React.createElement(
      PrismCode,
      { className: `language-${language || "javascript"}` },
      value
    )
  );
}
