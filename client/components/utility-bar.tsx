import styled from "../types/styled-components";
import * as DefaultStyles from "../utils/defaultStyles";

export const Container = styled.aside`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 8px 0 16px;
  padding: 8px 0;
  font-family: ${DefaultStyles.fonts.sans};
`;

export const Items = styled.div`
  display: flex;
  align-items: center;
`;
