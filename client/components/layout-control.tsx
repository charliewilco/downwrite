import * as React from "react";
import styled, { StyledFunction } from "styled-components";
import * as DefaultStyles from "../utils/defaultStyles";

const Box = styled.div``;

interface ILayoutTrigger {
  active: boolean;
  theme?: any;
  onClick: () => void;
}

interface ILayoutControl {
  layout: boolean;
  layoutChange: (x: boolean) => void;
}

const trigger: StyledFunction<ILayoutTrigger & React.HTMLProps<HTMLDivElement>> =
  styled.div;

const LayoutTrigger = trigger`
  display: inline-block;
  margin: 8px 0 8px 16px;
  cursor: pointer;
  font-size: 14px;
  font-family: ${DefaultStyles.fonts.sans};
  color: inherit;
  opacity: ${(props: ILayoutTrigger) => (props.active ? 1 : 0.5)};
  &:after {
    content: '';
    display: block;
    border-bottom: 3px solid
      ${(props: ILayoutTrigger) =>
        props.active
          ? props.theme.link || DefaultStyles.colors.blue400
          : "transparent"};
  }
`;

const LayoutControl: React.SFC<ILayoutControl> = ({ layout, layoutChange }) => (
  <Box>
    <LayoutTrigger
      data-testid="LAYOUT_CONTROL_GRID"
      active={layout}
      onClick={() => layoutChange(true)}>
      Grid
    </LayoutTrigger>
    <LayoutTrigger
      data-testid="LAYOUT_CONTROL_LIST"
      active={!layout}
      onClick={() => layoutChange(false)}>
      List
    </LayoutTrigger>
  </Box>
);

export default LayoutControl;
