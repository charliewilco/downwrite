import React from 'react'

const CloseIcon = ({ size, fill }) => (
	<svg width={size} height={size} viewBox="0 0 12 12" style={{ display: 'block' }}>
		<title>Close</title>
		<g id="Canvas" transform="translate(-1561 -730)">
			<g id="Close">
				<g id="Combined Shape">
					<use xlinkHref="#modalClose" transform="translate(1561 730)" fill={fill} />
				</g>
			</g>
		</g>
		<defs>
			<path
				id="modalClose"
				fillRule="evenodd"
				d="M 6.70588 6L 12 0.705882L 11.2941 0L 6 5.29412L 0.705882 2.83725e-14L 0 0.705882L 5.29412 6L 0 11.2941L 0.705882 12L 6 6.70588L 11.2941 12L 12 11.2941L 6.70588 6Z"
			/>
		</defs>
	</svg>
)

CloseIcon.defaultProps = {
	size: 12,
	fill: '#4382A1'
}

export default CloseIcon
