import React from 'react'
import { Block } from 'glamor/jsxstyle'
import Check from './Checkbox'

const Privacy = ({ title, publicStatus, onChange }) => (
	<Block width="100%" maxWidth={512} marginBottom={16}>
		<h3 className="f6" style={{ marginBottom: 16 }}>
			Public
		</h3>
		<small>
			All posts are private by default, by selecting this option you're allowing anyone who has
			a URL to see the content.
		</small>
		<Block>
			<Block component="label" fontSize={12} padding="16px 0">
				<Check checked={publicStatus} onChange={onChange} value={publicStatus} />
				<span
					style={{
						marginLeft: 16,
						display: 'inline-block',
						verticalAlign: 'middle',
						lineHeight: 1.1
					}}>
					<em>{title}</em> is <span>{publicStatus ? 'Public' : 'Private'}</span>
				</span>
			</Block>
		</Block>
	</Block>
)

export default Privacy
