import React from 'react'
import { Flex, Block } from 'glamor/jsxstyle'
import { isEmpty } from 'ramda'

const pos = {
  bottom: 8,
  right: 8,
  position: 'fixed'
}

export default ({ data, env, onDismiss }) => (
  <Block
    fontSize={12}
    backgroundColor={isEmpty(data) ? '#CF4832' : '#29994F'}
    color='white'
    padding={8}
    zIndex={500}
    {...pos}>
    <Flex alignItems='center'>
      <div>
        <Block>
          {isEmpty(data) ? 'Something is wrong with the API' : data.post}
        </Block>
        <small>Environment: {env}</small>
      </div>
      <Block cursor='pointer' marginLeft={16} fontSize={16} onClick={onDismiss}>
        &times;
      </Block>
    </Flex>
  </Block>
)
