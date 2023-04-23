import { SiteFooter } from "@components/footer";
import { NextPage } from "next";
import { StaticContentWrapper } from "@components/content";
import { CustomMeta } from "@components/custom-meta";

const AboutDetails: NextPage = () => {
	return (
		<div>
			<CustomMeta title="About" path="about" />
			<StaticContentWrapper title="About Downwrite">
				<div>
					<div data-testid="ABOUT_PAGE">
						<p>
							So the idea here was simple build a simple markdown writing
							application. Markdown is a huge deal and all the cool tools kept
							getting shut down and naively, I thought, how hard can this really be?
							So I&#39;ve had poorly designed iterations of this thing for every year
							on the year as one of these services got shut down. When Canvas shut
							down this last year, I started to get a little more serious about this
							idea.
						</p>
						<p>
							During planning out some of my quarterly goals at my last job I decided
							to go a little more full-stack with Node and start to really work
							through the process of building a microservice. Since I&#39;m never
							really one to learning languages and frameworks in the abstract, I
							decided to take up Downwrite as an excuse to build those microservice.
						</p>
						<p>
							Writing should be easy. But as each tool, each static site builder
							comes and falls out of popularity or gets shut down,
							<strong>**markdown**</strong> remains the central and portbale format.
						</p>

						<p>
							The goal of building Downwrite was to create a place to write and share
							content with that universal format; to be able to import and export in
							markdown, to write in markdown and share your work.
						</p>
						<h2>Features</h2>
						<h3>All Markdown</h3>
						<p>
							Downwrite lets you import markdown files, edit with markdown shortcuts
							and export markdown file with YAML frontmatter that you can use in your
							Jekyll / Gatsby / WordPress / whatever site. Markdown is a really
							ubiquitous format.
						</p>
						<h3>Share Your Work</h3>
						<p>
							When you write and want to share your work, select the privacy setting
							to make your entry public and get a URL to share. All posts are private
							by default.
						</p>
						<h3>Offline Support</h3>
						<p>
							Sometimes when you&#39;re working you lose connectivity, Downwrite will
							save a local draft of your work and let you work without a connection
							and suggest a draft to save when you&#39;re back online.
						</p>
						<h2>Why Markdown?</h2>
						<p>
							Markdown is probably the most efficient and universal tool for
							conveying syntax, semantics and structure across platforms.
						</p>
						<p>
							Originally coined by John Gruber (Daring Fireball) it was originally
							conceived as a text to HTML and is the stable of static site
							generators, OSS and a fair amount.
						</p>
					</div>
				</div>
			</StaticContentWrapper>
			<SiteFooter />
		</div>
	);
};

export default AboutDetails;
