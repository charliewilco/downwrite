import * as React from "react";
import Link from "next/link";

interface PreviewLinkProps {
  publicStatus: boolean;
  id: string;
}

const PreviewLink: React.FC<PreviewLinkProps> = props => {
  return props.publicStatus ? (
    <>
      <Link
        prefetch
        passHref
        href={{ pathname: "/preview", query: { id: props.id } }}>
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
