import React from 'react'
import { Flex, Block } from 'glamor/jsxstyle'
import { Link } from 'react-router-dom'
import { css } from 'glamor'

const s = {
	title: css({
		fontSize: 14,
		fontWeight: 500,
		fontFamily: 'var(--secondary-font)',
		'@media (min-width: 57.75rem)': { fontSize: 16 }
	}),
	delete: css({
		color: 'var(--color-2)',
		border: 0,
		appearance: 'none',
		WebkitFontSmoothing: 'antialiased'
	}),
	content: css({
		fontSize: `small`,
		opacity: 0.875,
		padding: 16
	}),
	card: css({
		borderLeftWidth: 4,
		borderLeftStyle: 'solid',
		borderColor: `var(--color-1)`,
		height: '100%',
		fontWeight: 500,
		boxShadow: '0 0 2px rgba(0,0,0,.07), 0 2px 4px rgba(0,0,0,.12)',
		backgroundColor: 'white'
	}),
	meta: css({
		opacity: 0.5,
		fontFamily: 'var(--primary-font)',
		fontWeight: 400
	}),
	edit: css({
		fontSize: 12,
		textAlign: 'right',
		textTransform: 'uppercase',
		letterSpacing: 2,
		'@media (min-width: 57.75rem)': {
			fontSize: 14,
			fontWeight: 700
		}
	})
}

const DeleteButton = ({ onDelete }) => (
	<span className={css(s.edit, s.delete)} onClick={onDelete}>
		<svg width={18} height={18} viewBox="0 0 14 18">
			<desc>Delete this Post</desc>

			<g id="Views" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
				<g id="Artboard" transform="translate(-72.000000, -172.000000)">
					<g id="ic_delete_forever_black_24px" transform="translate(67.000000, 169.000000)">
						<polygon id="Shape" points="0 0 24 0 24 24 0 24" />
						<path
							d="M6,19 C6,20.1 6.9,21 8,21 L16,21 C17.1,21 18,20.1 18,19 L18,7 L6,7 L6,19 Z M8.46,11.88 L9.87,10.47 L12,12.59 L14.12,10.47 L15.53,11.88 L13.41,14 L15.53,16.12 L14.12,17.53 L12,15.41 L9.88,17.53 L8.47,16.12 L10.59,14 L8.46,11.88 Z M15.5,4 L14.5,3 L9.5,3 L8.5,4 L5,4 L5,6 L19,6 L19,4 L15.5,4 Z"
							id="Shape"
							fill="#D8EAF1"
							fillRule="nonzero"
						/>
						<polygon id="Shape" points="0 0 24 0 24 24 0 24" />
					</g>
				</g>
			</g>
		</svg>
	</span>
)

const EditButton = ({ id }) => (
	<Link to={`/${id}/edit`} className={s.edit}>
		<svg width={18} height={18} viewBox="0 0 18 18">
			<desc>Edit this Post</desc>
			<g id="Views" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
				<g id="Artboard" transform="translate(-70.000000, -134.000000)">
					<g id="ic_mode_edit_black_24px" transform="translate(67.000000, 131.000000)">
						<path
							d="M3,17.25 L3,21 L6.75,21 L17.81,9.94 L14.06,6.19 L3,17.25 Z M20.71,7.04 C21.1,6.65 21.1,6.02 20.71,5.63 L18.37,3.29 C17.98,2.9 17.35,2.9 16.96,3.29 L15.13,5.12 L18.88,8.87 L20.71,7.04 Z"
							id="Shape"
							fill="#185A70"
							fill-rule="nonzero"
						/>
						<polygon id="Shape" points="0 0 24 0 24 24 0 24" />
					</g>
				</g>
			</g>
		</svg>
	</Link>
)

const Card = ({ title, id, content, author, onDelete }) => (
	<Block className={css(s.card)}>
		<Flex
			borderBottom="1px solid #f2f2f2"
			padding={16}
			justifyContent="space-between"
			alignItems="flex-start">
			<div>
				<h2 className={s.title}>
					<Link to={`/${id}/edit`}>{title}</Link>
				</h2>
				<small className={s.meta}>{author}</small>
			</div>
			<Flex flexDirection="column" className={css(s.action)}>
				<EditButton id={id} />
				<DeleteButton onDelete={onDelete} />
			</Flex>
		</Flex>

		<Block>
			{content && <p className={s.content}>{content.blocks[0].text.substr(0, 90)}</p>}
		</Block>
	</Block>
)

export default Card
