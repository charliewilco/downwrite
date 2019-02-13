import * as React from "react";
import styled from "styled-components";
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

const ToolbarButton = styled.div`
  display: inline-block;
  padding: 8px;
  flex: 1 1 auto;
  text-align: center;
  color: ${DefaultStyles.colors.blue700};
  font-size: 12px;
  transition: all 250ms ease-in-out;
`;

interface IToolbarButtonProps {
  style: string;
  onToggle: (x: string) => void;
  active: boolean;
  label: string;
}

function findIcon(label: string, active: boolean): React.ReactNode {
  switch (label) {
    case "Quote":
      return React.createElement(BlockQuote, { active });
    case "Bullets":
      return React.createElement(BulletedList, { active });
    case "Numbers":
      return React.createElement(Numbers, { active });
    case "Code":
      return React.createElement(Code, { active });
    case "Bold":
      return React.createElement(Bold, { active });
    case "Italic":
      return React.createElement(Italic, { active });
    case "Underline":
      return React.createElement(Underline, { active });
    case "Mono":
      return React.createElement(Mono, { active });
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
    <ToolbarButton onMouseDown={onToggle}>
      {findIcon(props.label, props.active)}
    </ToolbarButton>
  );
};

export default StyleButton;
