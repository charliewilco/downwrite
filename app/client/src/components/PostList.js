import React from 'react'
import { css } from 'glamor'
import { Flex, Block } from 'glamor/jsxstyle'
import Card from './Card'
import LayoutControl from './LayoutControl'
import ListItem from './PostListItem'

const s = {
	main: css({
		paddingTop: 16,
		marginBottom: 24,
		fontWeight: 400
	}),
	title: css({
		fontWeight: 500,
		fontSize: 18,
		'@media (min-width: 57.75rem)': {
			fontSize: 24
		}
	}),
	grid: css({
		'@media (min-width: 48rem)': { marginLeft: -20 }
	}),
	gridItem: css({
		marginBottom: 24,
		width: '100%',
		'@media (min-width: 48rem)': { paddingLeft: 20, width: '50%' },
		'@media (min-width: 57.75rem)': { width: `${100 / 3}%` },
		'@media (min-width: 75rem)': { width: `${100 / 4}%` }
	}),
	listItem: css({
		padding: '16px 0',
		width: '100%',
		flex: 1,
		'&:not(:last-of-type)': {
			borderBottom: `1px solid #CCC`
		}
	})
}

export default ({ posts, layout, layoutChange, onDelete }) => (
	<Block>
		<Flex justifyContent="space-between" alignItems="center" marginBottom={24}>
			<h1 className={css(s.title)}>Posts</h1>
			<LayoutControl layout={layout} layoutChange={layoutChange} />
		</Flex>
		{layout === 'grid' ? (
			<Flex component="ul" flexWrap="wrap" className={css(s.grid)} listStyle="none inside">
				{posts.map(p => (
					<Block key={p.id} component="li" className={css(s.gridItem)}>
						<Card {...p} onDelete={() => onDelete(p)} />
					</Block>
				))}
			</Flex>
		) : (
			<Block>
				{posts.map(p => (
					<Block key={p.id} component="li" className={css(s.listItem)}>
						<ListItem {...p} onDelete={() => onDelete(p)} />
					</Block>
				))}
			</Block>
		)}
	</Block>
)
