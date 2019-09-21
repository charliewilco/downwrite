import * as React from "react";

export default function DetailsFeature(): JSX.Element {
  return (
    <React.Fragment>
      <h2>Features</h2>
      <h3>All Markdown</h3>
      <p>
        Downwrite lets you import markdown files, edit with markdown shortcuts and
        export markdown file with YAML frontmatter that you can use in your Jekyll /
        Gatsby / WordPress /whatever site. Markdown is a really ubiquitous format.
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
    </React.Fragment>
  );
}
