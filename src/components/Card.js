import React from 'react'
import { Flex, Block } from 'glamor/jsxstyle'
import { Link } from 'react-router-dom'
import { css } from 'glamor'
import distance from 'date-fns/distance_in_words_to_now'

const s = {
	title: css({
		fontSize: 14,
		marginBottom: 0,
		fontWeight: 700,
		'@media (min-width: 57.75rem)': { fontSize: 18 }
	}),
	delete: css({
		color: 'var(--color-2)',
		border: 0,
		background: 'none',
		appearance: 'none',
		WebkitFontSmoothing: 'antialiased'
	}),
	content: css({
		fontSize: 12
	}),
	card: css({
		fontWeight: 400,
		boxShadow: '0 0 2px rgba(0,0,0,.07), 0 2px 4px rgba(0,0,0,.12)',
		backgroundColor: 'white'
	}),
	meta: css({
		fontSize: 12,
		display: 'block',
		color: '#757575',
		fontWeight: 400
	}),
	tray: css({
		'& a': {
			color: '#4382A1'
		}
	})
}

const Card = ({ title, id, content, dateAdded, onDelete }) => (
	<Flex
		height={192}
		flexDirection="column"
		justifyContent="space-between"
		className={css(s.card)}
		data-test="Card">
		<Block borderBottom="1px solid #DBDCDD" padding="12px 8px">
			<h2 className={css(s.title)}>
				<Link to={`/${id}/edit`}>{title}</Link>
			</h2>
			<small className={css(s.meta)}>added {distance(dateAdded)} ago</small>
		</Block>

		<Block padding={8} flex={1} overflow="hidden">
			{content && (
				<p data-test="snippet" className={css(s.content)}>
					{content.blocks[0].text.substr(0, 75)}
				</p>
			)}
		</Block>
		<Flex
			className={css(s.tray)}
			padding={8}
			fontWeight={700}
			fontSize={12}
			justifyContent="space-between"
			backgroundColor="rgba(101, 163, 191, .125)">
			<Link to={`/${id}/edit`}>Edit</Link>

			{onDelete && (
				<button className={css(s.delete)} onClick={onDelete}>
					Delete
				</button>
			)}
		</Flex>
	</Flex>
)

export default Card
