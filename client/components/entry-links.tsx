import * as React from "react";
import Link from "next/link";
import { UrlObject } from "url";

interface ICardLinks {
  id: string;
  title?: string;
  style?: React.CSSProperties;
  className?: string;
}

export function EditLink(props: ICardLinks): JSX.Element {
  const url: UrlObject = { pathname: "/edit", query: { id: props.id } };

  return (
    <Link prefetch passHref href={url}>
      <a className={props.className} style={props.style}>
        {props.title || "Edit"}
      </a>
    </Link>
  );
}

export function PreviewLink(props: ICardLinks): JSX.Element {
  const url: UrlObject = { pathname: "/preview", query: { id: props.id } };

  return (
    <Link prefetch passHref href={url}>
      <a className={props.className} style={props.style}>
        Preview
      </a>
    </Link>
  );
}
