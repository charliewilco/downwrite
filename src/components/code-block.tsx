import { useEffect, useRef } from "react";
import Prism from "prismjs";

interface ICodeBlockProps {
  language: string | "javascript";
  value: any;
}

export function CodeBlock({ language = "javascript", value }: ICodeBlockProps) {
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
