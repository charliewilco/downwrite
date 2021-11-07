import { useEffect, useRef } from "react";
import Prism from "prismjs";

interface ICodeBlockProps {
  language: string | "javascript";
  value: any;
}

const PrismCode: React.FC<{ className: string }> = ({ children, className }) => {
  const domRef = useRef(null);

  useEffect(() => {
    Prism.highlightElement(domRef.current, false);
  }, [children]);

  return (
    <code ref={domRef} className={className}>
      {children}
    </code>
  );
};

export function CodeBlock({ language = "javascript", value }: ICodeBlockProps) {
  return (
    <pre>
      <PrismCode className={`language-${language || "javascript"}`}>
        {value}
      </PrismCode>
    </pre>
  );
}
