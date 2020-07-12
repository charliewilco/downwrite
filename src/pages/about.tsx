import Head from "next/head";
import Content from "@components/content";
import Features from "@components/features";

export default function AboutDetails(): JSX.Element {
  return (
    <Content title="About Downwrite">
      <Head>
        <title>About Downwrite</title>
      </Head>
      <p>
        So the idea here was simple build a simple markdown writing application.
        Markdown is a huge deal and all the cool tools kept getting shut down and
        naively, I thought, how hard can this really be? So I&#39;ve had poorly
        designed iterations of this thing for every year on the year as one of these
        services got shut down. When Canvas shut down this last year, I started to
        get a little more serious about this idea.
      </p>
      <p>
        During planning out some of my quarterly goals at my last job I decided to go
        a little more full-stack with Node and start to really work through the
        process of building a microservice. Since I&#39;m never really one to
        learning languages and frameworks in the abstract, I decided to take up
        Downwrite as an excuse to build those microservice.
      </p>
      <Features />
      <h2>Features</h2>
      <h3>All Markdown</h3>
      <p>
        Downwrite lets you import markdown files, edit with markdown shortcuts and
        export markdown file with YAML frontmatter that you can use in your Jekyll /
        Gatsby / WordPress / whatever site. Markdown is a really ubiquitous format.
      </p>
      <h3>Share Your Work</h3>
      <p>
        When you write and want to share your work, select the privacy setting to
        make your entry public and get a URL to share. All posts are private by
        default.
      </p>
      <h3>Offline Support</h3>
      <p>
        Sometimes when you&#39;re working you lose connectivity, Downwrite will save
        a local draft of your work and let you work without a connection and suggest
        a draft to save when you&#39;re back online.
      </p>
      <h2>Why Markdown?</h2>
      <p>
        Markdown is probably the most efficient and universal tool for conveying
        syntax, semantics and structure across platforms.
      </p>
      <p>
        Originally coined by John Gruber (Daring Fireball) it was originally
        conceived as a text to HTML and is the stable of static site generators, OSS
        and a fair amount.
      </p>
    </Content>
  );
}
