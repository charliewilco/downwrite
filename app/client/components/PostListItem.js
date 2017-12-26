import React from 'react'
import { css } from 'glamor'
import { Block, Flex } from 'glamor/jsxstyle'
import Link from 'next/link'

const f2 = css({
	fontSize: 16,
	fontWeight: 500,
	'@media (min-width: 57.75rem)': { fontSize: 24 },
	'@media (min-width: 75rem)': { fontSize: 36 }
})

const deleteButton = css({
	appearance: 'none',
	border: 0
})

const ListItem = ({ title, id, onDelete }) => (
	<Flex justifyContent="space-between">
		<Block>
			<Link href={`/${id}/edit`}>
				<a className={css(f2)}>{title}</a>
			</Link>
		</Block>

		<button className={css(deleteButton)} onClick={onDelete}>
			<small>Delete</small>
		</button>
	</Flex>
)

export default ListItem
