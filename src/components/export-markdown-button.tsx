import { ExportIcon } from "./icons";

interface IExportMarkdownButtonProps {
  onClick: () => void;
}
export default function ExportMarkdownButton(
  props: IExportMarkdownButtonProps
): JSX.Element {
  return (
    <button className="ExportButton" onClick={props.onClick}>
      <ExportIcon className="Icon" />
      <small className="ExportLabel">Export</small>
    </button>
  );
}
