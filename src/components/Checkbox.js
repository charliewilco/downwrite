import React from 'react'
import { css } from 'glamor'

const sharedStyle = css({ appreance: 'none', border: 0 })
const checkedStyle = css(sharedStyle, { border: 0 })
const uncCheckedStyle = css(sharedStyle, { background: 'var(--color-1)' })

export default props => (
	<input
		type="checkbox"
		className={css(props.checked ? checkedStyle : uncCheckedStyle)}
		{...props}
	/>
)
