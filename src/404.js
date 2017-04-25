import React from 'react'
import Wrapper from './components/Wrapper'

const NoMatch = ({ location }) => (
  <div>
    <Wrapper className='u-center'>
      <h2>404</h2>
      <p>Sorry but {location.pathname} didn’t match any pages</p>
    </Wrapper>
  </div>
)

export default NoMatch
