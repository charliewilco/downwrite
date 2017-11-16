import React from 'react'
import { Block } from 'glamor/jsxstyle'
import { css } from 'glamor'
import Card from './Card'

export default ({ posts }) => (
	<Block>
		<h6 className={css({ fontSize: 12, marginBottom: 8 })}>Recent Entries</h6>
		{posts.slice(0, 2).map((post, i) => (
			<Block key={i} marginBottom={16}>
				<Card {...post} />
			</Block>
		))}
	</Block>
)
