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

const h = React.createElement;

interface IToolbarButtonProps {
  style: string;
  onToggle: (x: string) => void;
  active: boolean;
  label: string;
}

export default class StyleButton extends React.Component<IToolbarButtonProps> {
  findIcon = (label, active) => {
    switch (label) {
      case "Quote":
        return h(BlockQuote, { active });
      case "Bullets":
        return h(BulletedList, { active });
      case "Numbers":
        return h(Numbers, { active });
      case "Code":
        return h(Code, { active });
      case "Bold":
        return h(Bold, { active });
      case "Italic":
        return h(Italic, { active });
      case "Underline":
        return h(Underline, { active });
      case "Mono":
        return h(Mono, { active });
      default:
        return h(Label, { label, active });
    }
  };

  onToggle = e => {
    e.preventDefault();
    this.props.onToggle(this.props.style);
  };

  render() {
    const { active, label } = this.props;

    return (
      <ToolbarButton onMouseDown={this.onToggle}>
        {this.findIcon(label, active)}
      </ToolbarButton>
    );
  }
}
