import * as React from "react";
import PrismCode from "react-prism";
import * as DefaultStyles from "../utils/defaultStyles";

interface CodeBlockProps {
  language: string | "javascript";
  value: any;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language = "javascript", value }) => (
  <pre>
    <PrismCode className={`language-${language || "javascript"}`}>{value}</PrismCode>
    <style jsx>{`
      code {
        font-family: ${DefaultStyles.fonts.monospace};
      }
    `}</style>
  </pre>
);

export default CodeBlock;
