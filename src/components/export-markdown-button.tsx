import { FiDownload } from "react-icons/fi";

interface IExportMarkdownButtonProps {
  onClick: () => void;
}
export function ExportMarkdownButton(
  props: IExportMarkdownButtonProps
): JSX.Element {
  return (
    <button type="button" onClick={props.onClick}>
      <FiDownload />
      <small>Export</small>
    </button>
  );
}
