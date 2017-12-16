import React from 'react'
import { Link } from 'react-router-dom'
import { Block } from 'glamor/jsxstyle'
import { css } from 'glamor'
import Card from './Card'

export default ({ matches, posts }) => (
	<Block>
		<h6 className={css({ fontSize: 12, marginBottom: 8 })}>Recent Entries</h6>
		{posts.slice(0, 2).map((post, i) => (
			<Block key={i} marginBottom={16}>
				{matches ? (
					<Card {...post} />
				) : (
					<Link to={`/${post.id}/edit`} className="small">
						{post.title}
					</Link>
				)}
			</Block>
		))}
	</Block>
)
