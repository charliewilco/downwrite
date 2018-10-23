import styled from "styled-components";
import { fonts } from "../utils/defaultStyles";

export default styled.div`
  font-family: ${fonts.monospace};
  color: ${props => props.theme.color};
  background: ${props => props.theme.background};
  display: flex;
  flex-direction: column;
  flex: 1;
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  overflow: scroll;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    display: block;
    height: 4px;
    width: 100%;
    background-image: linear-gradient(to right, #2584a5, #4fa5c2);
  }

  a {
    background-color: transparent;
    text-decoration: none;
    color: ${props => props.theme.link};
  }

  a:active,
  a:hover {
    color: ${props => props.theme.linkHover};
    outline: 0;
  }
`;
