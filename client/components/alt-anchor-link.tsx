import styled, { css } from "styled-components";
import { colors } from "../utils/defaultStyles";

const AltAnchor = styled.a<{ space?: string }>`
  font-size: 14px;
  cursor: pointer;
  line-height: 1.1;
  opacity: 0.5;
  color: ${props => props.theme.color} !important;

  ${props =>
    props.space === "right"
      ? css`
          margin-right: 32px;
        `
      : props.space === "left"
        ? css`
            margin-left: 32px;
          `
        : null} &:hover,
  &:focus {
    color: ${colors.text};
    opacity: 1;
  }
`;

export default AltAnchor;
