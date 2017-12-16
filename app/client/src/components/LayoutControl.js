import React from 'react'
import { InlineBlock, Block } from 'glamor/jsxstyle'
import { css } from 'glamor'

const s = {
	active: css({
		'&:after': {
			content: '""',
			display: 'block',
			borderBottom: `5px solid var(--link)`
		}
	})
}

const LayoutControl = ({ layout, layoutChange }) => (
	<Block>
		<InlineBlock
			margin={8}
			cursor="pointer"
			fontSize={12}
			color={layout === 'grid' ? '#383838' : '#989898'}
			className={css(layout === 'grid' && s.active)}
			onClick={() => layoutChange('grid')}
			children="Grid"
		/>
		<InlineBlock
			margin={8}
			cursor="pointer"
			fontSize={12}
			color={layout === 'list' ? '#383838' : '#989898'}
			className={css(layout === 'list' && s.active)}
			onClick={() => layoutChange('list')}
			children="List"
		/>
	</Block>
)

export default LayoutControl
