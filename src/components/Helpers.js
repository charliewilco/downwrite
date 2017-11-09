import React from 'react'
import { Block } from 'glamor/jsxstyle'
import { css } from 'glamor'

const mdButton = css({
	border: 0,
	display: 'block',
	'& > svg': {
		display: 'block'
	}
})

let color = 'rgba(37, 132, 164, .5)'

export default ({ children }) => (
	<Block float="right" marginRight={-192} width={128}>
		{children}
	</Block>
)
