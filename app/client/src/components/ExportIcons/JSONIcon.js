import React from 'react'

export default ({ onClick }) => (
	<button className="Export" onClick={onClick}>
		<svg className="Export__icon" width="24" height="24" viewBox="0 0 24 24">
			<title>JSON Mark</title>
			<g id="Canvas" transform="translate(-1391 -866)">
				<g id="JSON_vector_logo">
					<g id="path7508">
						<use
							xlinkHref="#jsonfill0"
							transform="translate(1391 866.015)"
							fill="url(#paint0_linear)"
						/>
					</g>
					<g id="path7510">
						<use
							xlinkHref="#jsonfill1"
							transform="translate(1395.17 866)"
							fill="url(#paint1_linear)"
						/>
					</g>
				</g>
			</g>
			<defs>
				<linearGradient
					id="paint0_linear"
					x1="0"
					y1="0"
					x2="1"
					y2="0"
					gradientUnits="userSpaceOnUse"
					gradientTransform="matrix(16.9074 16.9074 -15.845 18.041 3.54957 3.5347)">
					<stop offset="0" stopColor="#4382A1" />
					<stop offset="1" stopColor="#FFFFFF" />
				</linearGradient>
				<linearGradient
					id="paint1_linear"
					x1="0"
					y1="0"
					x2="1"
					y2="0"
					gradientUnits="userSpaceOnUse"
					gradientTransform="matrix(-16.9074 -16.9074 13.9718 -20.4597 16.2899 20.457)">
					<stop offset="0" stopColor="#4382A1" />
					<stop offset="1" stopColor="#FFFFFF" />
				</linearGradient>
				<path
					id="jsonfill0"
					fillRule="evenodd"
					d="M 11.9797 17.8501C 17.2893 25.0884 22.4856 15.8298 22.478 10.2621C 22.469 3.67915 15.7969 0 11.9753 0C 5.84148 0 0 5.06941 0 12.0054C 0 19.7148 6.69606 23.9851 11.9753 23.9851C 10.7807 23.8131 6.79941 22.96 6.7459 13.7901C 6.70992 7.58812 8.76904 5.11029 11.9667 6.20026C 12.0383 6.22682 15.4938 7.58993 15.4938 12.0428C 15.4938 16.4768 11.9797 17.8501 11.9797 17.8501Z"
				/>
				<path
					id="jsonfill1"
					fillRule="evenodd"
					d="M 7.80645 6.21012C 4.29795 5.00084 0 7.89249 0 13.6844C 0 23.1416 7.00808 24 7.85762 24C 13.9915 24 19.833 18.9306 19.833 11.9946C 19.833 4.28521 13.1369 0.0148695 7.85762 0.0148695C 9.31984 -0.187631 15.7388 1.59736 15.7388 10.3704C 15.7388 16.0916 10.9458 19.2061 7.82843 17.8754C 7.75682 17.8488 4.30135 16.4857 4.30135 12.0328C 4.30135 7.59884 7.80645 6.21012 7.80645 6.21012L 7.80645 6.21012Z"
				/>
			</defs>
		</svg>

		<small className="Export__label">JSON</small>
	</button>
)
