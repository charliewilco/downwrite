import React from 'react'
import { Block, Flex } from 'glamor/jsxstyle'
import Avatar from './Avatar'

export default ({ username }) => (
	<Block textAlign='center' paddingTop={32} paddingBottom={32} paddingLeft={8} paddingRight={8}>
		<Avatar />
		<h6>{username}</h6>
	</Block>
)
