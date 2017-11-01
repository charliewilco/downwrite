import React from 'react'
import { Block } from 'glamor/jsxstyle'

export default ({ sm, ...props }) => (
	<Block
		maxWidth={sm ? 768 : 1088}
		marginRight="auto"
		marginLeft="auto"
		{...props}
	/>
)
