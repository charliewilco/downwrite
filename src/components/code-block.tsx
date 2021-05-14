import * as React from "react";
import Prism from "prismjs";

interface ICodeBlockProps {
  language: string | "javascript";
  value: any;
}

const PrismCode: React.FC<{ className: string }> = ({ children, className }) => {
  const domRef = React.useRef(null);

  React.useEffect(() => {
    Prism.highlightElement(domRef.current, false);
  }, [children]);

  return (
    <code ref={domRef} className={className}>
      {children}
    </code>
  );
};

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
