import styled from "styled-components";

const Wrapper = styled.div`
  margin-left: auto;
  margin-right: auto;
  max-width: ${({ sm, xs }: { sm?: boolean; xs?: boolean }) =>
    sm ? "768px" : xs ? "384px" : "1088px"};
`;

Wrapper.displayName = `Wrapper`;

export default Wrapper;
