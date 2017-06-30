import React from 'react'
import { css } from 'glamor'
import { Flex, Block } from 'glamor-jsxstyle'

let ripple = css.keyframes('ripple', {
  '0%': {
    transform: `scale(0.1)`,
    opacity: 1,
  },
  '70%': {
    transform: `scale(1)`,
    opacity: 0.7,
  },
  '100%': {
    opacity: 0.0
  }
})

let spinners = size => css({
  position: 'absolute',
  top: -2,
  left: (size / -2 + 1),
  width: size,
  height: size,
  borderRadius: `100%`,
  border: `2px solid currentColor`,
  animationFillMode: 'both',
  animation: `${ripple} 1.25s 0s infinite cubic-bezier(0.21, 0.53, 0.56, 0.8)`
})

const Spinner = ({ size, color }) => (
  <Block position='relative' color={color} margin='auto' transform={`translateY(-${size/2}px)`}>
    <Block {...spinners(size)} animationDelay={`-0.6s`} />
    <Block {...spinners(size)} animationDelay={`-0.4s`} />
    <Block {...spinners(size)} animationDelay={`-0.2s`} />
  </Block>
)

const Loading =  ({ size }) => (
  <Flex
    justifyContent='center'
    flexDirection='column'
    alignItems='center'
    height={`calc(100% - ${size}px)`}
    position='relative'
  >
    <Spinner size={size} color='var(--color-1)' />
  </Flex>
)

Loading.defaultProps = {
  size: 75
}

export default Loading
