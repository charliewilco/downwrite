import * as React from "react";
import styled from "styled-components";
import * as DefaultStyles from "../utils/defaultStyles";

interface ILayoutTrigger {
  active: boolean;
  theme?: any;
  onClick: () => void;
}

interface ILayoutControl {
  layout: boolean;
  layoutChange: (x: boolean) => void;
}

const LayoutTrigger = styled.div<ILayoutTrigger>`
  display: inline-block;
  margin: 8px 0 8px 16px;
  cursor: pointer;
  font-size: 14px;
  font-family: ${DefaultStyles.fonts.sans};
  color: inherit;
  opacity: ${props => (props.active ? 1 : 0.5)};
  &:after {
    content: "";
    display: block;
    border-bottom: 3px solid
      ${(props: ILayoutTrigger) =>
        props.active
          ? props.theme.link || DefaultStyles.colors.blue400
          : "transparent"};
  }
`;

const LayoutControl: React.FC<ILayoutControl> = function(props) {
  return (
    <div>
      <LayoutTrigger
        data-testid="LAYOUT_CONTROL_GRID"
        active={props.layout}
        onClick={() => props.layoutChange(true)}>
        Grid
      </LayoutTrigger>
      <LayoutTrigger
        data-testid="LAYOUT_CONTROL_LIST"
        active={!props.layout}
        onClick={() => props.layoutChange(false)}>
        List
      </LayoutTrigger>
    </div>
  );
};

export default LayoutControl;
