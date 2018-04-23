import React, { Component } from 'react'
import styled from 'styled-components'
import color from 'rcolor'

const initialState = {
  a: color() || `#FEB692`,
  b: color() || `#EA5455`
}

class RandomColor extends Component {
  state = initialState

  render() {
    return this.props.children(this.state)
  }
}

const Avatar = styled.div`
  border-radius: 3rem;
  height: 3rem;
  width: 3rem;
  background: linear-gradient(
    135deg,
    ${props => props.colors.a || '#FEB692'} 10%,
    ${props => props.colors.b || '#EA5455'} 100%
  );
  margin: 0 auto 1rem;
`

export default () => <RandomColor>{colors => <Avatar colors={colors} />}</RandomColor>
