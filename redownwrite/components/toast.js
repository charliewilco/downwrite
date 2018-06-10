import styled from 'styled-components'
import { colors } from '../utils/defaultStyles'

// TODO: container should have the positioning
// Should be UI style and layout style from container

export default styled.div`
  color: ${colors.text};
  width: 10rem;
  text-align: center;
  top: 20px;
  left: 0;
  right: 0;
  z-index: 900;
  position: fixed;
  margin: auto;
  background-color: white;
  font-weight: 700;
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.12);
  padding: 0.25rem;
`
