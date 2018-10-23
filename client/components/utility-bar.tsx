import styled from "styled-components";
import { colors, fonts } from "../utils/defaultStyles";

export const Container = styled.aside`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 8px 0 16px;
  padding: 8px 0;
  color: ${colors.text};
  font-family: ${fonts.sans};
`;

export const Items = styled.div`
  display: flex;
  align-items: center;
`;
