import React from 'react'
import { Block } from 'glamor/jsxstyle'

/* TypeError: cyclic object value */
export default () => (
	<Block
		width={160}
		textAlign="center"
		top={20}
		right={0}
		left={0}
		zIndex="900"
		position="fixed"
		margin="auto"
		backgroundColor="white"
		boxShadow="0 0 2px rgba(0,0,0,.07), 0 2px 4px rgba(0,0,0,.12)"
		padding={4}>
		Autosaving
	</Block>
)
