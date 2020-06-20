import * as React from "react";
import Link from "next/link";

interface ICardLinks {
  id: string;
  title?: string;
  style?: React.CSSProperties;
  className?: string;
}

interface IInitialCardLinkProps {
  pathname: string;
}

function CardLink(props: ICardLinks & IInitialCardLinkProps): JSX.Element {
  return (
    <Link href={`${props.pathname}/${props.id}`} passHref>
      <a className={props.className} style={props.style}>
        {props.title}
      </a>
    </Link>
  );
}

export function EditLink(props: ICardLinks): JSX.Element {
  return React.createElement(
    CardLink,
    Object.assign({}, { pathname: "/edit", title: "Edit" }, props)
  );
}

export function PreviewLink(props: ICardLinks): JSX.Element {
  return React.createElement(
    CardLink,
    Object.assign({}, { pathname: "/preview", title: "Preview" }, props)
  );
}
