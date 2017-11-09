import React from 'react'
import { Block } from 'glamor/jsxstyle'

export default (props) => (
	<Block
		boxShadow='0 0 2px rgba(0,0,0,.07), 0 2px 4px rgba(0,0,0,.12)'
		backgroundColor='white'
		{...props}
	/>
)
