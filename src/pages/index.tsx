import { NextPage } from "next";
import Link from "next/link";
import Head from "next/head";
import { Routes } from "@utils/routes";

const IndexPage: NextPage = () => {
  return (
    <article>
      <Head>
        <title>Downwrite</title>
      </Head>
      <header>
        <h1>
          <span>Editing &amp; Sharing Shouldn't Be Hard</span>
          <span>Writing Should Be</span>
        </h1>
        <p>A place to write</p>
      </header>
      <section>
        <p>
          Between every word processor ever and every other way to write, we need a
          minimal solution that uses a central set of syntax: Markdown.
        </p>
        <h2>Focus on Markdown</h2>

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
            <a data-testid="HOME_LOGIN_FAKE_BUTTON">Login or Sign up</a>
          </Link>
        </div>
      </aside>
    </article>
  );
};

export default IndexPage;
