import css from "styled-jsx/css";
import React from "react";

import format from "date-fns/format";

interface IContentWrapperProps {
	title?: string;
	dateAdded?: Date;
	content?: React.ReactNode;
}

export const content = css.global`
	.__content h2 {
		font-size: 2rem;
		font-weight: 800;
		margin-bottom: 1.5rem;
	}

	.__content h3 {
		font-weight: 700;
		font-size: 1.5rem;
		margin-bottom: 1rem;
	}

	.__content li > ul,
	.__content li > ol {
		margin-bottom: 0;
	}

	.__content ul,
	.__content ol {
		list-style-position: inside;
	}

	.__content ul,
	.__content ol,
	.__content pre,
	.__content hr,
	.__content p {
		margin-bottom: 1.5rem;
	}

	.__content p,
	.__content li {
		line-height: 1.625;
	}

	.__content blockquote {
		font-style: italic;
		background: #d4ecfe;
		margin-bottom: 1.5rem;
		color: var(--onyx-800);
	}

	.__content blockquote p {
		padding: 1rem;
	}
`;

export const StaticContentWrapper: React.FC<
	Omit<IContentWrapperProps, "content" | "dateAdded">
> = ({ children, title }) => {
	return (
		<div className="outer">
			<article className="harticle">
				<header>
					<h1 data-testid="PREVIEW_ENTRTY_TITLE">{title}</h1>
				</header>
				<section data-testid="PREVIEW_ENTRTY_BODY" className="__content">
					<div>{children}</div>
				</section>
			</article>
			<style jsx>
				{`
					.outer {
						max-width: 48rem;
						margin: 1rem auto;
					}
					article {
						font-family: var(--serif);
					}

					header {
						padding: 1.5rem 0;
					}

					time {
						opacity: 50%;
						font-family: var(--monospace);
					}

					h1 {
						font-size: 2rem;
						font-weight: 900;
						font-family: var(--sans-serif);
					}

					section {
						display: grid;
						gap: 1rem;
						grid-template-columns: repeat(12, minmax(0, 1fr));
					}

					section > aside {
						grid-column: span 12 / span 12;
					}

					section > div {
						grid-column: span 12 / span 12;
					}

					@media (min-width: 40rem) {
						section > aside {
							grid-column: span 3 / span 3;
						}
						section > div {
							grid-column: span 9 / span 9;
						}
					}
				`}
			</style>
			<style jsx global>
				{content}
			</style>
		</div>
	);
};

export const ContentWrapper: React.FC<IContentWrapperProps> = (props) => {
	return (
		<div className="outer">
			<article className="harticle">
				<header>
					{props.dateAdded && (
						<time
							data-testid="PREVIEW_ENTRTY_META"
							dateTime={props.dateAdded.toString()}>
							{format(new Date(props.dateAdded.toString()), "dd MMMM yyyy")}
						</time>
					)}
					<h1 data-testid="PREVIEW_ENTRTY_TITLE">{props.title}</h1>
				</header>
				<section data-testid="PREVIEW_ENTRTY_BODY" className="__content">
					<aside>{props.children}</aside>
					<div>{props.content}</div>
				</section>
			</article>
			<style jsx>
				{`
					.outer {
						max-width: 48rem;
						margin: 1rem auto;
					}
					article {
						font-family: var(--serif);
					}

					header {
						padding: 1.5rem 0;
					}

					time {
						opacity: 50%;
						font-family: var(--monospace);
					}

					h1 {
						font-size: 2rem;
						font-weight: 900;
						font-family: var(--sans-serif);
					}

					section {
						display: grid;
						gap: 1rem;
						grid-template-columns: repeat(12, minmax(0, 1fr));
					}

					section > aside {
						grid-column: span 12 / span 12;
					}

					section > div {
						grid-column: span 12 / span 12;
					}

					@media (min-width: 40rem) {
						section > aside {
							grid-column: span 3 / span 3;
						}
						section > div {
							grid-column: span 9 / span 9;
						}
					}
				`}
			</style>
			<style jsx global>
				{content}
			</style>
		</div>
	);
};
