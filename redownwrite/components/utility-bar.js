import styled from 'styled-components'
import { colors } from '../utils/defaultStyles'

const UtilityBarContainer = styled.aside`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 16px 0;
  padding: 8px;
  background: white;
  color: ${colors.text};
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.12);
`

const UtilityBarItems = styled.div`
  display: flex;
  align-items: center;
`

const UtilityBar = {
  Container: UtilityBarContainer,
  Items: UtilityBarItems
}

export default UtilityBar
