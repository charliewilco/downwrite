import React from 'react'
import { Block } from 'glamor/jsxstyle'
import Media from 'react-media'

export default ({ children }) => (
	<Media query={{ minWidth: 500 }}>
		{m => (
			<Block float={m ? "right": "none"} marginRight={m && -192} width={m && 128}>
				{children}
			</Block>
		)}
	</Media>
)
