import * as React from "react";
import styled, { StyledFunction } from "styled-components";
import { colors, fonts } from "../utils/defaultStyles";

const Box = styled.div``;

interface ILayoutTrigger {
  active: boolean;
  theme?: any;
  onClick: () => void;
}

interface ILayoutControl {
  layout: string | "grid" | "list";
  layoutChange: (x: string) => void;
}

const trigger: StyledFunction<ILayoutTrigger & React.HTMLProps<HTMLDivElement>> =
  styled.div;

const LayoutTrigger = trigger`
  display: inline-block;
  margin: 8px 0 8px 16px;
  cursor: pointer;
  font-size: 12px;
  font-family: ${fonts.sans};
  color: inherit;
  opacity: ${(props: ILayoutTrigger) => (props.active ? 1 : 0.5)};
  &:after {
    content: '';
    display: block;
    border-bottom: 3px solid
      ${(props: ILayoutTrigger) =>
        props.active ? props.theme.link || colors.blue400 : "transparent"};
  }
`;

const LayoutControl: React.SFC<ILayoutControl> = ({ layout, layoutChange }) => (
  <Box>
    <LayoutTrigger active={layout === "grid"} onClick={() => layoutChange("grid")}>
      Grid
    </LayoutTrigger>
    <LayoutTrigger active={layout === "list"} onClick={() => layoutChange("list")}>
      List
    </LayoutTrigger>
  </Box>
);

export default LayoutControl;
