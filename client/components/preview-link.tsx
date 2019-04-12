import * as React from "react";
import Link from "next/link";
import { UrlObject } from "url";

interface IPreviewLinkProps {
  publicStatus: boolean;
  id: string;
}

export default function PreviewLink(props: IPreviewLinkProps): JSX.Element {
  const link: UrlObject = {
    pathname: "/preview",
    query: { id: props.id }
  };
  return props.publicStatus ? (
    <>
      <Link prefetch passHref href={link}>
        <a>Preview</a>
      </Link>
      <style jsx>{`
        a {
          display: block;
          font-size: 12px;
          line-height: 1;
        }
      `}</style>
    </>
  ) : null;
}
