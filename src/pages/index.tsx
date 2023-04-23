import { NextPage } from "next";
import Link from "next/link";
import { Routes } from "@shared/routes";
import { content } from "@components/content";
import { SiteFooter } from "@components/footer";
import { CustomMeta } from "@components/custom-meta";

const IndexPage: NextPage = () => {
	return (
		<div className="container">
			<CustomMeta />
			<article className="__content">
				<header>
					<h1>
						Editing &amp; Sharing Shouldn&apos;t Be Hard.{" "}
						<span>Writing Should Be</span>
					</h1>
					<p>Downwrite is a place to write</p>
				</header>
				<section>
					<p>
						Between every word processor ever and every other way to write, we need a
						minimal solution that uses a central set of syntax: Markdown.
					</p>
					<h3>Focus on Markdown</h3>
					<p>
						Writing should be easy. But as each tool, each static site builder comes
						and falls out of popularity or gets shut down,
						<strong>**markdown**</strong> remains the central and portbale format.
					</p>

					<p>
						The goal of building Downwrite was to create a place to write and share
						content with that universal format; to be able to import and export in
						markdown, to write in markdown and share your work.
					</p>
					<p>Sign up for early access to simply your writing workflow.</p>
				</section>
				<aside>
					<div>
						<Link href={Routes.LOGIN} passHref>
							<a data-testid="HOME_LOGIN_FAKE_BUTTON" className="base-button">
								Login or Sign up
							</a>
						</Link>
					</div>
				</aside>
			</article>
			<SiteFooter />

			<style jsx>{`
				.outer {
				}
				article {
					max-width: 33rem;
					margin: 2rem auto;
					font-family: var(--serif);
					padding: 0.5rem;
				}

				header {
					text-align: center;
					margin-left: -2rem;
					margin-right: -2rem;
				}

				h1 {
					margin-bottom: 2rem;
					font-size: 2rem;
				}

				h1 > span {
					color: var(--pixieblue-400);
					display: block;
				}

				header p {
					font-size: 1.25rem;
					font-style: italic;
					opacity: 0.75;
				}

				aside {
					font-family: var(--sans-serif);
					padding: 2rem 0;
				}

				aside > div {
					display: flex;
					justify-content: center;
				}
			`}</style>

			<style jsx global>
				{content}
			</style>
		</div>
	);
};

export default IndexPage;
