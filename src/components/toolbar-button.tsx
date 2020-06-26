import {
  BlockQuote,
  BulletedList,
  Numbers,
  Code,
  Bold,
  Italic,
  Mono,
  Underline,
  Label
} from "./toolbar-icons";

interface IToolbarButtonProps {
  style: string;
  onToggle: (x: string) => void;
  active: boolean;
  label: string;
}

function findIcon(label: string, active: boolean): React.ReactNode {
  switch (label) {
    case "Quote":
      return <BlockQuote active={active} />;
    case "Bullets":
      return <BulletedList active={active} />;
    case "Numbers":
      return <Numbers active={active} />;
    case "Code":
      return <Code active={active} />;
    case "Bold":
      return <Bold active={active} />;
    case "Italic":
      return <Italic active={active} />;
    case "Underline":
      return <Underline active={active} />;
    case "Mono":
      return <Mono active={active} />;
    default:
      return <Label label={label} active={active} />;
  }
}

export default function StyleButton(props: IToolbarButtonProps): JSX.Element {
  const onToggle = (e: React.MouseEvent<HTMLDivElement>): void => {
    e.preventDefault();
    props.onToggle(props.style);
  };

  return (
    <div className="ToolbarButton" onMouseDown={onToggle}>
      {findIcon(props.label, props.active)}
    </div>
  );
}
