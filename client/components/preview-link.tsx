import * as React from "react";
import Link from "next/link";
import { UrlObject } from "url";

interface PreviewLinkProps {
  publicStatus: boolean;
  id: string;
}

const PreviewLink: React.FC<PreviewLinkProps> = props => {
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
};

export default PreviewLink;
