import styled from "../types/styled-components";

export const Grid = styled.ul`
  list-style: none inside;
  display: flex;
  flex-wrap: wrap;
  @media (min-width: 48rem) {
    margin-left: -20px;
  }
`;

export const GridItem = styled.li`
  margin-bottom: 24px;
  width: 100%;

  @media (min-width: 48rem) {
    padding-left: 20px;
    width: 50%;
  }

  @media (min-width: 57.75rem) {
    width: ${`${100 / 3}%`};
  }

  @media (min-width: 75rem) {
    width: ${`${100 / 4}%`};
  }

  @media (min-width: 112.5rem) {
    width: ${`${100 / 5}%`};
  }

  @media (min-width: 150rem) {
    width: ${`${100 / 6}%`};
  }

  @media (min-width: 187.5rem) {
    width: ${`${100 / 7}%`};
  }
`;
