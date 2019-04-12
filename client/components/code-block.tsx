import * as React from "react";
import PrismCode from "react-prism";
import * as DefaultStyles from "../utils/defaultStyles";

interface ICodeBlockProps {
  language: string | "javascript";
  value: any;
}

export default function CodeBlock({
  language = "javascript",
  value
}: ICodeBlockProps) {
  return (
    <pre>
      <PrismCode className={`language-${language || "javascript"}`}>
        {value}
      </PrismCode>
      <style jsx>{`
        code {
          font-family: ${DefaultStyles.Fonts.monospace};
        }
      `}</style>
    </pre>
  );
}
