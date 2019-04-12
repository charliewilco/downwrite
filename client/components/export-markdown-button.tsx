import * as React from "react";
import { ExportIcon } from "./icons";

interface IExportMarkdownButtonProps {
  onClick: () => void;
}
export default function ExportMarkdownButton(
  props: IExportMarkdownButtonProps
): JSX.Element {
  return (
    <button onClick={props.onClick}>
      <ExportIcon className="Icon" />
      <small className="Label">Export</small>
      <style jsx>
        {`
          button {
            border: 0;
            display: flex;
            align-items: center;
            font-family: inherit;
            appearance: none;
            color: inherit;
            line-height: inherit;
            background: none;
            box-sizing: inherit;
          }

          .Label {
            margin-left: 8px;
            font-size: 12px;
          }
        `}
      </style>
    </button>
  );
}
