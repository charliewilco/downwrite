import React from 'react'
import styled from 'styled-components'
import Spinner from './Spinner'
import { colors } from '../utils/defaultStyles'

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  position: relative;
  height: calc(100% - ${props => props.size}px);
`

const Loading = ({ size }) => (
  <LoadingContainer>
    <Spinner size={size} color={colors.blue400} />
  </LoadingContainer>
)

Loading.defaultProps = {
  size: 75
}

export default Loading
