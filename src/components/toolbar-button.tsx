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
  const props = { active };
  switch (label) {
    case "Quote":
      return <BlockQuote {...props} />;
    case "Bullets":
      return <BulletedList {...props} />;
    case "Numbers":
      return <Numbers {...props} />;
    case "Code":
      return <Code {...props} />;
    case "Bold":
      return <Bold {...props} />;
    case "Italic":
      return <Italic {...props} />;
    case "Underline":
      return <Underline {...props} />;
    case "Mono":
      return <Mono {...props} />;
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
