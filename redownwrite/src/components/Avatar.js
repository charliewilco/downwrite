import React, { Component } from 'react'
import { Block } from 'glamor/jsxstyle'
import color from 'rcolor'

const initialState = {
  a: color() || `#FEB692`,
  b: color() || `#EA5455`
}

class RandomColor extends Component {
  state = initialState

  render() {
    return this.props.children(this.state.a, this.state.b)
  }
}

export default () => (
  <RandomColor>
    {(A, B) => (
      <Block
        borderRadius={48}
        width={48}
        height={48}
        background={`linear-gradient(135deg, ${A} 10%, ${B} 100%)`}
        marginLeft="auto"
        marginRight="auto"
        marginBottom={16}
      />
    )}
  </RandomColor>
)
