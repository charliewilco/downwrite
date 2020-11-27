import { FiDownload } from "react-icons/fi";

interface IExportMarkdownButtonProps {
  onClick: () => void;
}
export default function ExportMarkdownButton(
  props: IExportMarkdownButtonProps
): JSX.Element {
  return (
    <button className="flex" onClick={props.onClick}>
      <FiDownload />
      <small className="ml-2">Export</small>
    </button>
  );
}
