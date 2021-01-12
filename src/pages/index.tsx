import { NextPage } from "next";
import Link from "next/link";
import Head from "next/head";
import { Routes } from "@utils/routes";

const IndexPage: NextPage = () => {
  return (
    <article className="mx-auto max-w-2xl px-4 my-32 text-left">
      <Head>
        <title>Downwrite</title>
      </Head>
      <header>
        <h1 className="tracking-tight font-black text-3xl md:text-4xl font-serif mb-4">
          <span className="block mb-2">Editing &amp; Sharing Shouldn't Be Hard</span>
          <span className="block text-pixieblue-500">Writing Should Be</span>
        </h1>
        <p className="text-xl font-bold italic opacity-50 font-serif">
          A place to write
        </p>
      </header>
      <section className="mt-3 text-base font-mono text-gray-500 sm:text-md md:mt-5 mb-16">
        <p className="mb-4">
          Between every word processor ever and every other way to write, we need a
          minimal solution that uses a central set of syntax: Markdown.
        </p>
        <h2 className="font-bold font-sans text-xl mb-4">Focus on Markdown</h2>

        <p className="mb-4">
          Writing should be easy. But as each tool, each static site builder comes
          and falls out of popularity or gets shut down,
          <strong>**markdown**</strong> remains the central and portbale format.
        </p>

        <p className="mb-4">
          The goal of building Downwrite was to create a place to write and share
          content with that universal format; to be able to import and export in
          markdown, to write in markdown and share your work.
        </p>
        <p className="mb-4">
          Sign up for early access to simply your writing workflow.
        </p>
      </section>
      <aside className="font-sans">
        <div className="text-center">
          <Link href={Routes.LOGIN} passHref>
            <a
              data-testid="HOME_LOGIN_FAKE_BUTTON"
              className="transition duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-110 inline-block shadow py-3 border border-transparent text-lg font-bold rounded-md text-pixieblue-600 bg-white hover:bg-gray-50 md:py-4 md:px-12">
              Login or Sign up
            </a>
          </Link>
        </div>
      </aside>
    </article>
  );
};

export default IndexPage;
