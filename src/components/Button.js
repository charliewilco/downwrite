// @flow

import React from 'react'
import { css } from 'glamor'

const btn = css({
	display: 'block',
	fontSize: 14,
	backgroundColor: 'var(--color-6)',
	transition: 'background-color 250ms ease-in-out',
	color: '#282828',
	fontWeight: 700,
	border: 0,
	paddingTop: 4,
	paddingLeft: 18,
	paddingRight: 18,
	paddingBottom: 4,
	borderRadius: 4,
	boxShadow: '0 0 4px rgba(0,0,0,.037), 0 4px 8px rgba(0,0,0,.07)',
	':hover': {
		backgroundColor: 'var(--color-7)'
	}
})

type Props = {
	args: Object
}

const Button = ({ ...args }: Props) => <button className={css(btn)} {...args} />

export default Button
