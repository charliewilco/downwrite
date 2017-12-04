import React from 'react'
import { Block } from 'glamor/jsxstyle'

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
			<Block component="label">
				<input
					type="checkbox"
					checked={publicStatus}
					onChange={onChange}
					value={publicStatus}
				/>
				<span>
					<em>{title}</em> is <span>{publicStatus ? 'Public' : 'Private'}</span>
				</span>
			</Block>
		</Block>
	</Block>
)

export default Privacy
