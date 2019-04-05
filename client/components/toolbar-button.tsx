import * as React from "react";
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
import * as DefaultStyles from "../utils/defaultStyles";

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
      return React.createElement(BlockQuote, props);
    case "Bullets":
      return React.createElement(BulletedList, props);
    case "Numbers":
      return React.createElement(Numbers, props);
    case "Code":
      return React.createElement(Code, props);
    case "Bold":
      return React.createElement(Bold, props);
    case "Italic":
      return React.createElement(Italic, props);
    case "Underline":
      return React.createElement(Underline, props);
    case "Mono":
      return React.createElement(Mono, props);
    default:
      return React.createElement(Label, { label, active });
  }
}

const StyleButton: React.FC<IToolbarButtonProps> = function(props) {
  const onToggle = (e: React.MouseEvent<HTMLDivElement>): void => {
    e.preventDefault();
    props.onToggle(props.style);
  };

  return (
    <div className="ToolbarButton" onMouseDown={onToggle}>
      {findIcon(props.label, props.active)}
      <style jsx>{`
        .ToolbarButton {
          display: inline-block;
          padding: 8px;
          flex: 1 1 auto;
          text-align: center;
          color: ${DefaultStyles.colors.blue700};
          font-size: 12px;
          transition: all 250ms ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default StyleButton;
