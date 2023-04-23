import { NextPage } from "next";

const Custom404: NextPage = () => {
	return (
		<div>
			<h1>
				<span>404</span>Page Not Found
			</h1>

			<style jsx>{`
				div {
					margin: 2rem auto;
					max-width: 38rem;
					width: 100%;
					padding: 0 0.5rem;
				}

				h1 {
					text-align: center;
					font-family: var(--sans-serif);
					font-weight: 400;
				}

				span {
					font-family: var(--monospace);
					font-weight: 700;
					display: block;
					margin-bottom: 1rem;
				}
			`}</style>
		</div>
	);
};

export default Custom404;
