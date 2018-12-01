import styled from "../types/styled-components";

interface ISpacedBox {
  align?: string;
}

const SpacedBox = styled.div<ISpacedBox>`
  padding: 16px;
  text-align: ${props => props.align};
`;

export default SpacedBox;
