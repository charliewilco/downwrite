import React from 'react'
import { InlineBlock, Block, Flex } from 'glamor/jsxstyle'
import Avatar from './Avatar'

export default ({ username }) => (
	<Block
		textAlign="center"
		paddingTop={32}
		paddingBottom={32}
		paddingLeft={8}
		paddingRight={8}
		borderBottom='1px solid #DBDCDD'>
		<Avatar />
		<InlineBlock component='span' fontSize={16} fontWeight={700}>{username}</InlineBlock>
	</Block>
)
