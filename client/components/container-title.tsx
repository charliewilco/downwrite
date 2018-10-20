import styled from "styled-components";
import { fonts } from "../utils/defaultStyles";

const ContainerTitle = styled.h1`
  font-weight: 300;
  font-size: 18px;
  font-family: ${fonts.sans};

  @media (min-width: 57.75rem) {
    font-size: 24px;
  }
`;

export default ContainerTitle;
