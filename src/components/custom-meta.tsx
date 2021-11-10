import Head from "next/head";
import { createMetadata } from "@shared/constants";
import { useMemo } from "react";

interface ICustomMetaProps {
  title?: string;
  path?: string;
}

export const CustomMeta: React.VFC<ICustomMetaProps> = ({ title, path }) => {
  const meta = useMemo(() => createMetadata(path, title), [title, path]);
  return (
    <Head>
      <title>{meta.PAGE_TITLE}</title>
      <meta
        name="viewport"
        content="initial-scale=1.0, width=device-width"
        key="viewport"
      />
      <meta charSet="utf-8" />
      <meta name="title" content={meta.PAGE_TITLE} />
      <link rel="canonical" href={meta.PAGE_URL} />
      <meta property="og:url" content={meta.PAGE_URL} />
      <meta property="og:title" content={meta.PAGE_TITLE} />
      <meta property="twitter:url" content={meta.PAGE_URL} />
      <meta property="twitter:title" content={meta.PAGE_TITLE} />
    </Head>
  );
};
