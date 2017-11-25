import React from 'react'
import { Block, Flex } from 'glamor/jsxstyle'
import Media from 'react-media'

export default ({ children }) => (
	<Media query={{ minWidth: 500 }}>
		{m => (
			<Block float={m ? "right": "none"} marginRight={m && -128} width={m && 96}>
				<Flex
					marginBottom={16}
					flexDirection={m ? 'column' : 'row-reverse'}
					justifyContent={!m && 'space-between'}
					paddingLeft={!m && 8}
					paddingRight={!m && 8}>
				{children}
			</Flex>
			</Block>
		)}
	</Media>
)
